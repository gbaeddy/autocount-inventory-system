<?php

namespace App\Listeners;

use App\Events\UserStatusChanged;
use App\Mail\UserStatusUpdated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\InteractsWithQueue;

class SendStatusUpdateEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 10;

    public function handle(UserStatusChanged $event): void
    {
        try {
            Log::info('SendStatusUpdateEmail listener triggered', [
                'user' => $event->userData['username'],
                'status' => $event->userData['newStatus'],
                'attempt' => $this->attempts()
            ]);

            Mail::to($event->userData['email'])
                ->send(new UserStatusUpdated(
                    $event->userData['username'],
                    $event->userData['newStatus']
                ));

            Log::info('Status update email sent successfully', [
                'email' => $event->userData['email']
            ]);

        } catch (\Exception $e) {
            Log::warning('Failed to send status update email', [
                'error' => $e->getMessage(),
                'user' => $event->userData['username'],
                'trace' => $e->getTraceAsString(),
                'attempt' => $this->attempts()
            ]);

            // If we've tried 3 times, we'll log a final error and stop trying
            if ($this->attempts() === 3) {
                Log::error('Failed to send status update email after 3 attempts', [
                    'user' => $event->userData['username'],
                    'email' => $event->userData['email'],
                    'status' => $event->userData['newStatus']
                ]);
            } else {
                // Otherwise, we'll throw the exception so the job is retried
                throw $e;
            }
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(UserStatusChanged $event, \Throwable $exception)
    {
        Log::error('Status update email job failed', [
            'user' => $event->userData['username'],
            'email' => $event->userData['email'],
            'status' => $event->userData['newStatus'],
            'error' => $exception->getMessage()
        ]);
    }
}
