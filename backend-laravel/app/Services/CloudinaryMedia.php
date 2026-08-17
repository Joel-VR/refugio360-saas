<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CloudinaryMedia
{
    public function upload(UploadedFile $file, string $folder): string
    {
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
