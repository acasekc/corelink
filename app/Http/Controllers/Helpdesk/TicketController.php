<?php

namespace App\Http\Controllers\Helpdesk;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Helpdesk\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(
        private TicketService $ticketService,
    ) {}

    /**
     * Get all tickets (admin listing with filters).
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'project' => $request->input('project'),
            'project_id' => $request->input('project_id'),
            'status' => $request->input('status'),
            'status_id' => $request->input('status_id'),
            'priority' => $request->input('priority'),
            'priority_id' => $request->input('priority_id'),
            'assignee_id' => $request->input('assignee_id'),
            'unassigned' => $request->boolean('unassigned'),
            'search' => $request->input('search'),
        ];

        $tickets = $this->ticketService->paginate(
            $request->integer('per_page', 20),
            array_filter($filters, fn ($value) => $value !== null && $value !== false),
        );

        return response()->json([
            'data' => TicketResource::collection($tickets->items()),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = $this->ticketService->create($request->validated());

        return response()->json(
            ['data' => new TicketResource($ticket)],
            201
        );
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket): JsonResponse
    {
        $this->authorize('view', $ticket);

        $ticket = $this->ticketService->getById($ticket->id);

        return response()->json(['data' => new TicketResource($ticket)]);
    }

    /**
     * Update the specified ticket.
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);

        $updated = $this->ticketService->update($ticket, $request->validated());

        return response()->json(['data' => new TicketResource($updated)]);
    }

    /**
     * Delete the specified ticket.
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);

        $this->ticketService->delete($ticket);

        return response()->json(status: 204);
    }
}
