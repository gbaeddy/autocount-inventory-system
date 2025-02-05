<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class UserStatusChanged implements ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userData;

    /**
     * Create a new event instance.
     */
    public function __construct($userData)
    {
        $this->userData = $userData;
    }
}
