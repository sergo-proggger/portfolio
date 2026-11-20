<?php
// Фрагмент WordPress-темы: functions.php.

function sg_acf_ready() {
    return function_exists('acf_add_local_field_group');
}

function sg_get_field_safe($name, $post_id = false, $fallback = '') {
    $post_id = $post_id ? (int) $post_id : (int) get_queried_object_id();
    if (!$post_id) return $fallback;
    $value = get_post_meta($post_id, $name, true);
    return ($value !== null && $value !== '' && $value !== false) ? $value : $fallback;
}

function sg_get_repeater_rows($name, $post_id, $subfields) {
    $post_id = (int) $post_id;
    if (!$post_id) return array();
    $count = (int) get_post_meta($post_id, $name, true);
    if ($count < 1) return array();
    $rows = array();
    for ($i = 0; $i < $count; $i++) {
        $row = array();
        foreach ($subfields as $subfield) {
            $row[$subfield] = get_post_meta($post_id, $name . '_' . $i . '_' . $subfield, true);
        }
        $rows[] = $row;
    }
    return $rows;
}

function sg_img_list($folder, $files) {
    $out = array(); foreach ($files as $file) $out[] = sg_asset('projects/'.$folder.'/'.$file.'.jpg'); return $out;
}
