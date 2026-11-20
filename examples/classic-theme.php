<?php
// Фрагмент WordPress-темы: functions.php.

function wedding_theme_register_menus() {
    register_nav_menus(array(
        'primary' => __('Главное меню', 'wedding-theme'),
    ));
}

function wedding_theme_fallback_menu() {
    echo '<ul class="nav-menu">';
    echo '<li><a href="#history">История</a></li>';
    echo '<li><a href="#dresscode">Dress code</a></li>';
    echo '<li><a href="#timing">Тайминг</a></li>';
    echo '<li><a href="#venue">Место</a></li>';
    echo '<li><a href="#rsvp">Анкета</a></li>';
    echo '</ul>';
}

function wedding_theme_sections() {
    get_template_part('template-parts/section-hero');
    get_template_part('template-parts/section-official');
    get_template_part('template-parts/section-history');
    get_template_part('template-parts/section-moments');
    get_template_part('template-parts/section-timer');
    get_template_part('template-parts/section-venue');
    get_template_part('template-parts/section-timing');
    get_template_part('template-parts/section-wishes');
    get_template_part('template-parts/section-dresscode');
    get_template_part('template-parts/section-rsvp');
    get_template_part('template-parts/section-organizer');
    get_template_part('template-parts/section-footer');
}
