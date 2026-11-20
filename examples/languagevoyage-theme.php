<?php
// Фрагмент WordPress-темы: functions.php.

function eml_get($key, $default='') {
    if (function_exists('get_field')) {
        $v = get_field($key);
        if ($v !== null && $v !== false && $v !== '') return $v;
    }
    return $default;
}

function eml_img($key, $fallback) {
    if (function_exists('get_field')) {
        $v = get_field($key);
        if (is_array($v) && !empty($v['url'])) return $v['url'];
        if (is_numeric($v)) { $u = wp_get_attachment_image_url((int)$v, 'full'); if ($u) return $u; }
        if (is_string($v) && $v) return $v;
    }
    return get_template_directory_uri() . '/assets/images/' . ltrim($fallback, '/');
}

function eml_has($key) {
    if (!function_exists('get_field')) return false;
    $v = get_field($key);
    if (is_array($v) && !empty($v['url'])) return true;
    if (is_numeric($v) && (int)$v > 0) return true;
    if (is_string($v) && $v !== '') return true;
    return false;
}

function eml_file($key, $fallback) {
    if (function_exists('get_field')) {
        $v = get_field($key);
        if (is_array($v) && !empty($v['url'])) return $v['url'];
        if (is_numeric($v)) { $u = wp_get_attachment_url((int)$v); if ($u) return $u; }
        if (is_string($v) && $v) return $v;
    }
    return get_template_directory_uri() . '/assets/video/' . ltrim($fallback, '/');
}
