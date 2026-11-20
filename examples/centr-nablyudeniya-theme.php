<?php
// Фрагмент WordPress-темы: inc/acf-fields.php.

function cn_acf_groups() {
    $defaults = cn_defaults();
    $labels = ['brand'=>'Название компании','brand_image'=>'Изображение логотипа','hero_title'=>'Главный заголовок','hero_text'=>'Текст первого экрана','area'=>'Территория выезда','phone'=>'Телефон','email'=>'Почта для контактов и заявок','address'=>'Адрес','legal_name'=>'Полное имя ИП','inn'=>'ИНН','ogrnip'=>'ОГРНИП','services_heading'=>'Заголовок услуг','services_intro'=>'Описание услуг','solutions_heading'=>'Заголовок решений','why_heading'=>'Заголовок преимуществ','contact_heading'=>'Заголовок контактов','show_projects'=>'Показывать выполненные работы','callback_ready'=>'Включить приём заявок','consent_text'=>'Отдельное согласие на обработку данных','policy_text'=>'Политика обработки данных'];
    $tabs = [
        'Первый экран'=>['brand','brand_image','hero_title','hero_text','area'],
        'Услуги'=>array_merge(['services_heading','services_intro'], array_values(array_filter(array_keys($defaults), fn($k)=>strpos($k,'service_')===0))),
        'Объекты'=>array_merge(['solutions_heading'], array_values(array_filter(array_keys($defaults), fn($k)=>strpos($k,'solution_')===0))),
        'Преимущества'=>array_merge(['why_heading'], array_values(array_filter(array_keys($defaults), fn($k)=>strpos($k,'step_')===0))),
        'Контакты'=>['contact_heading','phone','email','address','legal_name','inn','ogrnip'],
        'Работы'=>['show_projects'],
        'Документы и заявки'=>['callback_ready','consent_text','policy_text'],
    ];
    $fields=[]; $n=0;
    foreach ($tabs as $tab=>$keys) {
        $fields[]=['key'=>'field_cn_tab_' . ++$n,'label'=>$tab,'name'=>'','type'=>'tab','placement'=>'top'];
        foreach ($keys as $key) {
            $value=$defaults[$key];
            $label=$labels[$key]??preg_replace('/^(service|solution|step)_(\d+)_(title|text)$/','$2: $3',$key);
            $label=str_replace([': title',': text'],[': заголовок',': описание'],$label);
            $type=is_bool($value)?'true_false':((str_ends_with($key,'_text')||$key==='services_intro')?'textarea':'text');
            if ($key==='email') $type='email';
            if ($key==='brand_image') $type='image';
            $field=['key'=>'field_cn_' . $key,'label'=>$label,'name'=>'cn_' . $key,'type'=>$type,'default_value'=>$value,'required'=>0];
            if ($type==='textarea') { $field['rows']=in_array($key,['consent_text','policy_text'],true)?14:3; $field['new_lines']=''; }
            if ($type==='true_false') { $field['ui']=1; $field['ui_on_text']='Да'; $field['ui_off_text']='Нет'; }
            if ($type==='image') { $field['return_format']='id'; $field['preview_size']='medium'; $field['mime_types']='jpg,jpeg,png,webp'; }
            if ($key==='callback_ready') $field['instructions']='Включать после утверждения документов, определения хранения данных и проверки доставки почты. Сейчас выключено.';
            if ($key==='show_projects') $field['instructions']='Сначала добавьте реальные фотографии и описания в разделе «Выполненные работы».';
            if (in_array($key,['phone','email','consent_text','policy_text'],true)) $field['required']=1;
            $fields[]=$field;
        }
    }
    return [
        ['key'=>'group_cn_home','title'=>'Наполнение сайта «Центр наблюдения»','fields'=>$fields,'location'=>[[['param'=>'page_type','operator'=>'==','value'=>'front_page']]],'position'=>'normal','style'=>'default','hide_on_screen'=>['the_content','discussion','comments','author','send-trackbacks'],'active'=>true],
        ['key'=>'group_cn_project','title'=>'Описание выполненной работы','fields'=>[
            ['key'=>'field_cn_project_photo','name'=>'cn_project_photo','label'=>'Фотография объекта','type'=>'image','return_format'=>'id','preview_size'=>'medium','required'=>1,'mime_types'=>'jpg,jpeg,png,webp'],
            ['key'=>'field_cn_project_description','name'=>'cn_project_description','label'=>'Что сделано на объекте','type'=>'textarea','rows'=>4,'new_lines'=>'','required'=>1],
        ],'location'=>[[['param'=>'post_type','operator'=>'==','value'=>'cn_project']]],'hide_on_screen'=>['the_content'],'active'=>true],
    ];
}
