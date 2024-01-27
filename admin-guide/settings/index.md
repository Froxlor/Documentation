# Settings

## 1. Main settings

Froxlor offers a variety of settings for the panel itself and the server services used. For the more demanding users, there is an advanced more which opens even more possibilities. Settings can also be _exported_ and _imported_ to and from other froxlor installations. You can always use the _Global search_ at the top if you are unsure where to find a specific setting.

<UiBrowser :src="('/img/frx_settings_overview.png')" alt="Settings overview"/>

As you can see, some features need to be activated explicitly for the rest of the settings in this section to take effect and be editable.

### 1.1 Unavailable/incompatible settings

<UiBrowser :src="('/img/frx_settings_unavail.png')" alt="Settings: unavailable settings"/>

Some settings cannot be changed or are unavailable due to other setting-values, e.g. the selected webserver. The latter can be _hidden_ by selecting the option `System settings -> Hide incompatible settings`.

### 1.2 Settings that require reconfiguration

<UiBrowser :src="('/img/frx_settings_reconf.png')" alt="Settings: Require reconfiguration of services"/>

A few settings will show the above notice. This means that adjusting the value or, in case of an enable/disable, when enabling it might be required to (re-)configure the shown services in `Configuration`, see [Configuration Guide](../configuration/) for more information.

### 1.3 Settings that require OTP validation

Settings that have a major impact on the system or which values are used to be executed with high privileges on the system require the admin-user to have set up and enabled _OTP_ for the corresponding account to change these values.

This behaviour can be disabled via the `disable_otp_security_check` flag in the [config.inc.php](#_3-settings-in-config-inc-php).

::: warning NOTE
In order to be able to adjust/change these settings, 2FA/OTP has to be enabled system-wide (__Settings -> Account settings -> Activate Two-factor authentication__). Additionally, the admin-user must have a valid 2FA method activated for his account.
:::

<UiBrowser :src="('/img/frx_settings_otp.png')" alt="Settings: Require OTP validation"/>

### 1.4 Import / Export of settings

<UiBrowser :src="('/img/frx_settings_imexport.png')" alt="Settings: Import / Export"/>

To **export** your current settings-set, click the `Download/export Settings` in the top-right corner. You can use the generated file to import your settings again or on another froxlor installation. Keep in mind that depending on your settings, possible sensitive data could be stored in the export-file.

In order to **import** settings, either from a possible backup or another froxlor installation, select the JSON file and press `Upload and import` to proceed. Depending on what settings are possibly overwritten, you might need to reconfigure some services, see [Configuration Guide](../configuration/) for more information.

## 2. Cronjob settings

Although it should not be necessary to adjust any values for the cronjobs as it is managed automatically by froxlor you might want or need to adjust intervals or enable/disable specific cronjobs if you are sure you know why.

<UiBrowser :src="('/img/frx_settings_cron.png')" alt="Cronjob settings"/>

## 3. Settings in `config.inc.php`

Options that are not adjustable via WebUI settings are read from the `lib/config.inc.php` file within the froxlor's base-directory (most likely /var/www/html/froxlor), in case it exists. By default, froxlor ships it as `lib/config.example.inc.php` so custom adjustments will not be overwritten by an update.

To overwrite the options in this file, rename/copy it and adjust as needed:

```bash
cd /var/www/html/froxlor
cp lib/config.example.inc.php lib/config.inc.php
```

### Available configuration flags

| Flag                           | Description                                                                                                                                                                                                                                                                                                                                              | Default value |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `enable_webupdate`             | enable/disable the possibility to update froxlor from within the web-interface, recommended value for debian/ubuntu package users is false to rely on apt and not have version mixup. This is also useful for providers that manage the servers but give admin access to froxlor to handle updates the way the providers does it (e.g. automation, etc.) | false         |
| `disable_otp_security_check`   | settings that have a major impact on the system or which values are used to be executed with high privileges on the system require the admin-user to have set up and enabled OTP for the corresponding account to change these values. To disable this extra security validation, set the value of this to true.                                         | false         |
