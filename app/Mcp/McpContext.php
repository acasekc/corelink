<?php

namespace App\Mcp;

use App\Models\Helpdesk\ApiKey;
use App\Models\Helpdesk\Project;

class McpContext
{
    protected static ?Project $project = null;

    protected static ?ApiKey $apiKey = null;

    public static function setProject(?Project $project): void
    {
        static::$project = $project;
    }

    public static function setApiKey(?ApiKey $apiKey): void
    {
        static::$apiKey = $apiKey;
    }

    public static function project(): ?Project
    {
        return static::$project;
    }

    public static function apiKey(): ?ApiKey
    {
        return static::$apiKey;
    }

    public static function clear(): void
    {
        static::$project = null;
        static::$apiKey = null;
    }
}
