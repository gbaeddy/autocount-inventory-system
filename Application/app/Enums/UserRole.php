<?php

namespace App\Enums;

enum UserRole : string
{
    case ADMIN = 'ADMIN';
    case OFFICE_STAFF = 'OFFICE_STAFF';
    case SALESPERSON = 'SALESPERSON';
}
