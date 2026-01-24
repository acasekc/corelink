<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload an image for the article editor.
     */
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'max:5120'], // 5MB max
        ]);

        $file = $request->file('image');

        if (! $file) {
            return response()->json(['error' => 'No file received'], 400);
        }

        // Validate image type
        if (! str_starts_with($file->getMimeType(), 'image/')) {
            return response()->json(['error' => 'File must be an image'], 400);
        }

        // Generate a unique filename
        $extension = $file->getClientOriginalExtension() ?: 'png';
        $filename = Str::uuid().'.'.$extension;

        try {
            // Store in public storage under articles folder
            $destinationPath = storage_path('app/public/articles');
            $file->move($destinationPath, $filename);

            $path = 'articles/'.$filename;
            $url = '/storage/'.$path;

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload image'], 500);
        }
    }
}
