<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'google_id',
        'last_seen',
        'description',
        'banner',
        'level',
        'rank',
        'prizes',
        'is_admin',
        'streak',
        'is_team',
        'ban',
        'coins',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'level' => 'integer',
        'prizes' => 'array',
        'rank' => 'array',
        'is_admin' => 'boolean',
        'last_seen' => 'datetime',
        'streak' => 'array',
        'description' => 'string',
        'is_team' => 'boolean',
        'ban' => 'boolean',
        'coins' => 'array',
    ];

    /**
     * Get the user data for use in Vue/React
     */
    public function toVueObject()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'banner' => $this->banner,
            'google_id' => $this->google_id ? true : false,
            'last_seen' => $this->last_seen,
            'description' => $this->description,
            'level' => $this->level,
            'rank' => $this->rank,
            'prizes' => $this->prizes,
            'is_admin' => $this->is_admin,
            'streak' => $this->streak,
            'is_team' => $this->is_team,
            'ban' => $this->ban,
            'coins' => $this->coins,
        ];
    }

    /**
     * Update last seen timestamp
     */
    public function updateLastSeen()
    {
        $this->last_seen = now();
        $this->save();
    }
}