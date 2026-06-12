<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdoptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shelter_id'     => ['required', 'exists:shelters,id'],
            'animal_id'      => ['required', 'exists:animals,id'],
            'applicant_name' => ['required', 'string', 'max:255'],
            'dni'            => ['required', 'digits:8'],
            'phone'          => ['required', 'digits:9'],
            'address'        => ['required', 'string', 'max:255'],
            'notes'          => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'dni.digits'           => 'El DNI debe tener exactamente 8 dígitos.',
            'phone.digits'         => 'El teléfono debe tener exactamente 9 dígitos.',
            'animal_id.exists'     => 'El animal seleccionado no existe.',
            'shelter_id.exists'    => 'El albergue no existe.',
        ];
    }
}
