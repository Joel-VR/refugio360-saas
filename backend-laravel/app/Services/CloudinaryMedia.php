<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class CloudinaryMedia
{
    private const MAX_DIMENSION = 1600;
    private const MAX_BYTES = 500 * 1024;
    private const OPTIMIZABLE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

    public function upload(UploadedFile $file, string $folder): string
    {
        $file = $this->optimizeImage($file);

        if (! $this->isConfigured()) {
            return $file->store($folder, 'public');
        }

        $timestamp = time();
        $params = [
            'folder' => trim($folder, '/'),
            'timestamp' => $timestamp,
        ];

        $response = Http::attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post($this->uploadUrl(), [
            ...$params,
            'api_key' => config('services.cloudinary.api_key'),
            'signature' => $this->signature($params),
        ]);

        $response->throw();

        return $response->json('secure_url');
    }

    public function delete(?string $path): void
    {
        if (! $path) {
            return;
        }

        if (! Str::startsWith($path, 'http')) {
            Storage::disk('public')->delete($path);
            return;
        }

        if (! $this->isConfigured() || ! Str::contains($path, 'res.cloudinary.com')) {
            return;
        }

        $publicId = $this->publicIdFromUrl($path);
        if (! $publicId) {
            return;
        }

        $timestamp = time();
        $params = [
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];

        Http::asForm()->post($this->destroyUrl($path), [
            ...$params,
            'api_key' => config('services.cloudinary.api_key'),
            'signature' => $this->signature($params),
        ]);
    }

    /**
     * Redimensiona y comprime imágenes rasterizadas antes de guardarlas.
     * El cliente ya comprime en el navegador; esto garantiza el límite
     * también cuando la subida no pasa por el frontend (o el JS falla).
     */
    private function optimizeImage(UploadedFile $file): UploadedFile
    {
        if (! in_array($file->getMimeType(), self::OPTIMIZABLE_MIMES, true)) {
            return $file;
        }

        $image = ImageManager::gd()->read($file->getRealPath());
        $image->scaleDown(width: self::MAX_DIMENSION, height: self::MAX_DIMENSION);

        $quality = 80;
        do {
            $encoded = match ($file->getMimeType()) {
                'image/webp' => $image->toWebp(quality: $quality),
                'image/png' => $image->toPng(),
                default => $image->toJpeg(quality: $quality),
            };
            $quality -= 15;
        } while (strlen((string) $encoded) > self::MAX_BYTES && $quality >= 35 && $file->getMimeType() !== 'image/png');

        $extension = pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION) ?: 'jpg';
        $tmpPath = tempnam(sys_get_temp_dir(), 'img_') . '.' . $extension;
        $encoded->save($tmpPath);
        register_shutdown_function(static fn () => @unlink($tmpPath));

        return new UploadedFile($tmpPath, $file->getClientOriginalName(), $file->getMimeType(), null, true);
    }

    private function isConfigured(): bool
    {
        return filled(config('services.cloudinary.cloud_name'))
            && filled(config('services.cloudinary.api_key'))
            && filled(config('services.cloudinary.api_secret'));
    }

    private function uploadUrl(): string
    {
        return sprintf(
            'https://api.cloudinary.com/v1_1/%s/auto/upload',
            config('services.cloudinary.cloud_name')
        );
    }

    private function destroyUrl(string $path): string
    {
        $resourceType = Str::endsWith(parse_url($path, PHP_URL_PATH) ?? '', '.pdf') ? 'raw' : 'image';

        return sprintf(
            'https://api.cloudinary.com/v1_1/%s/%s/destroy',
            config('services.cloudinary.cloud_name'),
            $resourceType
        );
    }

    private function signature(array $params): string
    {
        ksort($params);

        $payload = collect($params)
            ->map(fn ($value, $key) => "{$key}={$value}")
            ->implode('&');

        return sha1($payload . config('services.cloudinary.api_secret'));
    }

    private function publicIdFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (! $path) {
            return null;
        }

        $afterUpload = Str::after($path, '/upload/');
        $withoutVersion = preg_replace('#^v\d+/#', '', $afterUpload);
        $withoutExtension = preg_replace('/\.[^.\/]+$/', '', $withoutVersion ?? '');

        return $withoutExtension ?: null;
    }
}
