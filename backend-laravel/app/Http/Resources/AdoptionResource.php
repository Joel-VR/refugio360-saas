<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdoptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shelter_id' => $this->shelter_id,
            'animal_id' => $this->animal_id,
            'applicant_name' => $this->applicant_name,
            'dni' => $this->dni,
            'phone' => $this->phone,
            'address' => $this->address,
            'status' => $this->status,
            'notes' => $this->notes,
            'pdf_path' => $this->pdf_path,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'animal' => $this->whenLoaded('animal'),
            'shelter' => $this->whenLoaded('shelter'),
        ];
    }
}
