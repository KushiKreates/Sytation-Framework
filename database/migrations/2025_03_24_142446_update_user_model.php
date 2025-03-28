<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add banner image url
            $table->string('banner')->nullable();
            
            // Add last seen timestamp
            $table->timestamp('last_seen')->nullable();
            
            // Add user description
            $table->text('description')->nullable();
            
            // Add user level
            $table->integer('level')->default(1);
            
            // Add rank information (stored as JSON)
            $table->json('rank')->nullable();
            
            // Add prizes information (stored as JSON)
            $table->json('prizes')->nullable();
            
            // Add admin flag
            $table->boolean('is_admin')->default(false);
            
            // Add streak information (stored as JSON)
            $table->json('streak')->nullable();
            
            // Add team flag
            $table->boolean('is_team')->default(false);
            
            // Add ban flag
            $table->boolean('ban')->default(false);
            
            // Add coins information (stored as JSON)
            $table->json('coins')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'banner',
                'last_seen',
                'description',
                'level',
                'rank',
                'prizes',
                'is_admin',
                'streak',
                'is_team',
                'ban',
                'coins'
            ]);
        });
    }
};
