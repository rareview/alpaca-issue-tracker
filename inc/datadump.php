<?php

add_action('wp_footer', function() {
    global $wp_query;
    $theme = wp_get_theme();
    $user = wp_get_current_user();

    $wp_data = array(
        "theme" => array(
            "stylesheet" => $theme->stylesheet,
            "version" => $theme->get("Version")
        ),
        "plugins" => get_option('active_plugins', false),
        "queryVars" => $wp_query->query_vars,
        "bodyClasses" => get_body_class(),
    );

    $user_data = array(
        "id" => $user->id,
        "displayName" => $user->display_name
    );

    // Combine all data into a single object
    $alpaca_data = array(
        "time" => time(),
        "user" => $user_data,
        "server" => $_SERVER,
        "wp" => $wp_data,
    );

    // Encode the JSON string into Base64:
    // $encoded_data = base64_encode(json_encode($alpaca_data));
    // Then to decode the Base64 string and parse the JSON:
    // in JS: decoded_data=atob(encoded_data) then JSON.parse(decoded_data);
    // in PHP: $decoded_data=base64_decode($encoded_string) then json_decode($decoded_string)

    $alpaca_json = json_encode($alpaca_data);

?>
<script type="text/javascript">
    const b = bowser.parse(window.navigator.userAgent);

    const alpaca_data = {
        "encoded": "<?php echo base64_encode($alpaca_json); ?>",
        "unencoded": <?php echo $alpaca_json; ?>,
        "device": {
            "browser": { name: b.browser.name, version: b.browser.version, },
            "vendor": b.platform.vendor,
            "type": b.platform.type,
            "os": b.os.name,
            "version": b.os.version,
            "versionName": b.os.versionName
        }
    };
</script>
<?php
}, 9999);