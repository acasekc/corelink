<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Generate a random password for the admin
        $password = 'admin123';
        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@corelink.dev'],
            [
                'name' => 'Admin',
                'password' => Hash::make($password),
                'is_admin' => true,
            ]
        );

        // Email the admin their credentials
        $this->command->info("Admin user created: {$admin->email}");
        $this->command->info("Password emailed to: {$admin->email}");
        $this->command->info($password);
        $this->call(ProjectSeeder::class);
        $this->call(HelpdeskSeeder::class);
        $this->call(HourlyRateCategorySeeder::class);
        $this->call(ArticleCategorySeeder::class);
    }
}
