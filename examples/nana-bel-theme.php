<?php
// Фрагмент WordPress-темы: functions.php.

function nad_field($key, $fallback = '') {
    $value = function_exists('get_field') ? get_field($key, (int) get_option('page_on_front')) : null;
    return ($value === null || $value === false || $value === '') ? $fallback : $value;
}

function nad_image($id, $size = 'nadezhda-gallery', $attributes = []) {
    if (!$id) { return ''; }
    $attributes = array_merge(['loading' => 'lazy', 'decoding' => 'async'], $attributes);
    return wp_get_attachment_image((int) $id, $size, false, $attributes);
}

function nad_measure($key) {
    $value = nad_field($key);
    if ($value === '' || !is_numeric($value)) { return ['— cm', '— in']; }
    $cm = (float) $value;
    return [rtrim(rtrim(number_format($cm, 1, '.', ''), '0'), '.') . ' cm', number_format($cm / 2.54, 1, '.', '') . ' in'];
}

function nad_gallery($key, $label, $class = '') {
    $ids = nad_field($key, []);
    if (!$ids) { return; }
    $count = count($ids);
    ?>
    <section class="gallery-section <?php echo esc_attr($class); ?>" id="<?php echo esc_attr($key); ?>" aria-labelledby="title-<?php echo esc_attr($key); ?>">
      <div class="section-head"><h2 id="title-<?php echo esc_attr($key); ?>"><?php echo esc_html($label); ?></h2><span class="section-count"><?php echo esc_html($count . ($count === 1 ? ' photograph' : ' photographs')); ?></span></div>
      <div class="photo-grid" data-gallery="<?php echo esc_attr($key); ?>">
      <?php foreach ($ids as $n => $id): $url = wp_get_attachment_image_url($id, 'full'); if (!$url) { continue; }
        $src = wp_get_attachment_image_src($id, 'nadezhda-gallery'); $ratio = ($src && $src[2]) ? round($src[1] / $src[2], 4) : 0.6667; ?>
        <a class="photo-link reveal<?php echo $ratio > 1.1 ? ' is-wide' : ''; ?>" href="<?php echo esc_url($url); ?>" style="--r:<?php echo esc_attr($ratio); ?>" aria-label="<?php echo esc_attr($label . ' — photograph ' . ($n + 1)); ?>">
          <?php echo nad_image($id, 'nadezhda-gallery', ['sizes' => '(max-width: 700px) 50vw, 33vw']); ?>
        </a>
      <?php endforeach; ?>
      </div>
    </section>
    <?php
}
