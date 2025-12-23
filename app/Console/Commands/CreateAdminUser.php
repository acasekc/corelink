<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create {email?} {--password=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update an admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?? $this->ask('Enter admin email');
        $password = $this->option('password') ?? $this->secret('Enter password');

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => explode('@', $email)[0],
                'password' => Hash::make($password),
                'is_admin' => true,
            ]
        );

        $this->info("Admin user created/updated: {$user->email}");

        return Command::SUCCESS;
    }
}
