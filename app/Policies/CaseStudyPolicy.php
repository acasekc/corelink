<?php

namespace App\Policies;

use App\Models\CaseStudy;
use App\Models\User;

class CaseStudyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, CaseStudy $caseStudy): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, CaseStudy $caseStudy): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, CaseStudy $caseStudy): bool
    {
        return $user->isAdmin();
    }

    public function publish(User $user, CaseStudy $caseStudy): bool
    {
        return $user->isAdmin();
    }
}
