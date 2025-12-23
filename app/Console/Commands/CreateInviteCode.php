<?php

namespace App\Console\Commands;

use App\Models\InviteCode;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateInviteCode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'discovery:invite 
                            {--code= : Custom invite code (auto-generated if not provided)}
                            {--email= : Email to associate with the invite}
                            {--expires= : Days until expiration (default: 30)}
                            {--uses= : Max number of uses (default: 1)}
                            {--admin= : Admin user ID (default: 1)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new invite code for the Discovery Bot';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $adminId = $this->option('admin') ?? 1;
        
        // Verify admin user exists
        $admin = User::find($adminId);
        if (!$admin) {
            $this->error("Admin user with ID {$adminId} not found.");
            $this->info("Creating a default admin user...");
            
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@corelink.dev',
                'password' => bcrypt('password'),
                'is_admin' => true,
            ]);
            
            $this->info("Created admin user: {$admin->email}");
            $adminId = $admin->id;
        }

        $code = $this->option('code') ?? strtoupper(Str::random(8));
        $expiresInDays = $this->option('expires') ?? 30;
        $maxUses = $this->option('uses') ?? 1;

        $inviteCode = InviteCode::create([
            'code' => $code,
            'admin_user_id' => $adminId,
            'invited_email' => $this->option('email'),
            'max_uses' => $maxUses,
            'times_used' => 0,
            'expires_at' => now()->addDays($expiresInDays),
        ]);

        $this->newLine();
        $this->info('✅ Invite code created successfully!');
        $this->newLine();
        
        $this->table(
            ['Field', 'Value'],
            [
                ['Code', $inviteCode->code],
                ['Admin ID', $inviteCode->admin_user_id],
                ['Email', $inviteCode->invited_email ?? 'Any'],
                ['Max Uses', $inviteCode->max_uses],
                ['Expires', $inviteCode->expires_at->format('Y-m-d H:i')],
            ]
        );

        $this->newLine();
        $this->info("Share this link: " . url("/discovery?code={$inviteCode->code}"));

        return Command::SUCCESS;
    }
}
