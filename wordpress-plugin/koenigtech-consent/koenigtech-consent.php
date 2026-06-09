<?php
/**
 * Plugin Name: KoenigTech Consent
 * Plugin URI: https://github.com/koenig-tech/koenigtech-consent-kit
 * Description: Reusable cookie and tracking consent manager for KoenigTech WordPress sites.
 * Version: 1.3.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: KoenigTech
 * Author URI: https://koenigtech.de/
 * License: GPL-2.0-or-later
 * Text Domain: koenigtech-consent
 *
 * @package KoenigTechConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'KOENIGTECH_CONSENT_VERSION', '1.3.0' );
define( 'KOENIGTECH_CONSENT_FILE', __FILE__ );
define( 'KOENIGTECH_CONSENT_DIR', plugin_dir_path( __FILE__ ) );
define( 'KOENIGTECH_CONSENT_URL', plugin_dir_url( __FILE__ ) );
define( 'KOENIGTECH_CONSENT_BASENAME', plugin_basename( __FILE__ ) );
define( 'KOENIGTECH_CONSENT_REPO', 'koenig-tech/koenigtech-consent-kit' );

require_once KOENIGTECH_CONSENT_DIR . 'includes/class-koenigtech-consent-plugin.php';
require_once KOENIGTECH_CONSENT_DIR . 'includes/class-koenigtech-consent-updater.php';

KoenigTech_Consent_Plugin::instance();
KoenigTech_Consent_Updater::instance();
