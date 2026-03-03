<?php

namespace App\Enums;

enum TaskStatus: string
{
    case TODO = 'todo';
    case IN_PROGRESS = 'in_progress';
    case DONE = 'done';

    public function label(): string
    {
        return match($this) {
            self::TODO => 'À faire',
            self::IN_PROGRESS => 'En cours',
            self::DONE => 'Terminé',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
