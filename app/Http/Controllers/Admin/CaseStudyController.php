<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCaseStudyRequest;
use App\Http\Requests\UpdateCaseStudyRequest;
use App\Http\Resources\CaseStudyResource;
use App\Services\CaseStudyService;
use Illuminate\Http\JsonResponse;

class CaseStudyController extends Controller
{
    public function __construct(protected CaseStudyService $caseStudyService) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\CaseStudy::class);

        $caseStudies = $this->caseStudyService->list();

        return response()->json(CaseStudyResource::collection($caseStudies));
    }

    public function store(StoreCaseStudyRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\CaseStudy::class);

        $caseStudy = $this->caseStudyService->create($request->validated());

        return response()->json(new CaseStudyResource($caseStudy), 201);
    }

    public function show(int $id): JsonResponse
    {
        $caseStudy = $this->caseStudyService->getById($id);

        $this->authorize('view', $caseStudy);

        return response()->json(new CaseStudyResource($caseStudy));
    }

    public function update(UpdateCaseStudyRequest $request, int $id): JsonResponse
    {
        $caseStudy = $this->caseStudyService->getById($id);

        $this->authorize('update', $caseStudy);

        $updated = $this->caseStudyService->update($caseStudy, $request->validated());

        return response()->json(new CaseStudyResource($updated));
    }

    public function destroy(int $id): JsonResponse
    {
        $caseStudy = $this->caseStudyService->getById($id);

        $this->authorize('delete', $caseStudy);

        $this->caseStudyService->delete($caseStudy);

        return response()->json([], 204);
    }

    public function togglePublish(int $id): JsonResponse
    {
        $caseStudy = $this->caseStudyService->getById($id);

        $this->authorize('publish', $caseStudy);

        $updated = $this->caseStudyService->togglePublish($caseStudy);

        return response()->json(new CaseStudyResource($updated));
    }
}
