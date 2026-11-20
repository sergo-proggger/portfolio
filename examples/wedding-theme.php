<?php
// Фрагмент WordPress-темы: functions.php.

function vii_wedding_date() {
    try {
        $date = (string)vii_option('wedding_date');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) { throw new Exception('date'); }
        return new DateTimeImmutable($date . ' ' . vii_option('ceremony_time') . ':00', new DateTimeZone('Europe/Saratov'));
    } catch (Exception $e) {
        return new DateTimeImmutable('2030-06-01 16:00:00', new DateTimeZone('Europe/Saratov'));
    }
}

function vii_wedding_date_label() {
    $date = vii_wedding_date();
    $months = array(1=>'января',2=>'февраля',3=>'марта',4=>'апреля',5=>'мая',6=>'июня',7=>'июля',8=>'августа',9=>'сентября',10=>'октября',11=>'ноября',12=>'декабря');
    return $date->format('j') . ' ' . $months[(int)$date->format('n')] . ' ' . $date->format('Y') . ' года';
}

function vii_calendar_markup() {
    $date = vii_wedding_date();
    $first = $date->modify('first day of this month');
    $padding = (int)$first->format('N') - 1;
    $days = (int)$date->format('t');
    $out = '';
    foreach (array('Пн','Вт','Ср','Чт','Пт','Сб','Вс') as $weekday) { $out .= '<span class="calendar-weekday">' . $weekday . '</span>'; }
    for ($i=0; $i<$padding; $i++) { $out .= '<span class="calendar-empty" aria-hidden="true"></span>'; }
    for ($d=1; $d<=$days; $d++) {
        $selected = $d === (int)$date->format('j');
        $out .= '<span class="calendar-day' . ($selected ? ' calendar-special' : '') . '"' . ($selected ? ' aria-label="День свадьбы, ' . esc_attr(vii_wedding_date_label()) . '"' : '') . '>' . (int)$d . '</span>';
    }
    return $out;
}
