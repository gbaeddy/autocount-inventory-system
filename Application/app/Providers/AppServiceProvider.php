<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use App\Models\Users;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The namespace for the controller routes.
     *
     * @var string
     */
    protected $namespace = 'App\\Http\\Controllers';

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->mapApiRoutes();

        // Automatically run migrations
        if (!Schema::hasTable('migrations')) {
            // Run migrations
            Artisan::call('migrate', ['--force' => true]);
        }

        // Seed the database with the admin user if not already seeded
        if (Users::where('role', \App\Enums\UserRole::ADMIN->value)->doesntExist()) {
            Artisan::call('db:seed', [
                '--class' => 'AdminSeeder',
                '--force' => true
            ]);
        }
    }

    protected function mapApiRoutes(): void
    {
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));
    }
}
