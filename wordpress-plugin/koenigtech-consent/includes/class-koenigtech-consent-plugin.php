<?php
/**
 * Main plugin class.
 *
 * @package KoenigTechConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class KoenigTech_Consent_Plugin {
	const OPTION_KEY = 'koenigtech_consent_settings';

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend' ) );
		add_action( 'wp_footer', array( $this, 'render_settings_link_host' ), 30 );
	}

	public static function defaults() {
		$privacy_url = function_exists( 'get_privacy_policy_url' ) ? get_privacy_policy_url() : '';
		$lang        = strpos( get_locale(), 'de_' ) === 0 ? 'de' : 'en';

		return array(
			'enabled'                => '1',
			'project_id'             => sanitize_title( get_bloginfo( 'name' ) ) ?: 'wordpress-site',
			'consent_version'        => '2026-06-09',
			'lang'                   => $lang,
			'fallback_lang'          => 'en',
			'privacy_url'            => $privacy_url ?: home_url( '/datenschutz/' ),
			'imprint_url'            => home_url( '/impressum/' ),
			'show_floating_settings' => '1',
			'auto_footer_link'       => '1',
			'google_consent_mode'    => '1',
			'ga4_id'                 => '',
			'google_ads_id'          => '',
			'gtm_id'                 => '',
			'meta_pixel_id'          => '',
		);
	}

	public static function settings() {
		$saved = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $saved ) ) {
			$saved = array();
		}

		return wp_parse_args( $saved, self::defaults() );
	}

	public function register_menu() {
		add_options_page(
			__( 'KoenigTech Consent', 'koenigtech-consent' ),
			__( 'KoenigTech Consent', 'koenigtech-consent' ),
			'manage_options',
			'koenigtech-consent',
			array( $this, 'render_settings_page' )
		);
	}

	public function register_settings() {
		register_setting(
			'koenigtech_consent',
			self::OPTION_KEY,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
				'default'           => self::defaults(),
			)
		);
	}

	public function sanitize_settings( $input ) {
		$input    = is_array( $input ) ? $input : array();
		$defaults = self::defaults();
		$output   = array();

		$checkboxes = array( 'enabled', 'show_floating_settings', 'auto_footer_link', 'google_consent_mode' );
		foreach ( $checkboxes as $key ) {
			$output[ $key ] = ! empty( $input[ $key ] ) ? '1' : '0';
		}

		$output['project_id']      = sanitize_key( $input['project_id'] ?? $defaults['project_id'] );
		$output['consent_version'] = sanitize_text_field( wp_unslash( $input['consent_version'] ?? $defaults['consent_version'] ) );
		$output['lang']            = $this->sanitize_lang( $input['lang'] ?? $defaults['lang'] );
		$output['fallback_lang']   = $this->sanitize_lang( $input['fallback_lang'] ?? $defaults['fallback_lang'] );
		$output['privacy_url']     = esc_url_raw( $input['privacy_url'] ?? $defaults['privacy_url'] );
		$output['imprint_url']     = esc_url_raw( $input['imprint_url'] ?? $defaults['imprint_url'] );
		$output['ga4_id']          = sanitize_text_field( wp_unslash( $input['ga4_id'] ?? '' ) );
		$output['google_ads_id']   = sanitize_text_field( wp_unslash( $input['google_ads_id'] ?? '' ) );
		$output['gtm_id']          = sanitize_text_field( wp_unslash( $input['gtm_id'] ?? '' ) );
		$output['meta_pixel_id']   = sanitize_text_field( wp_unslash( $input['meta_pixel_id'] ?? '' ) );

		return $output;
	}

	private function sanitize_lang( $value ) {
		$value = strtolower( sanitize_key( $value ) );

		return in_array( $value, array( 'de', 'en' ), true ) ? $value : 'en';
	}

	public function enqueue_frontend() {
		$settings = self::settings();

		if ( '1' !== $settings['enabled'] ) {
			return;
		}

		wp_enqueue_style(
			'koenigtech-consent',
			KOENIGTECH_CONSENT_URL . 'assets/koenig-consent.min.css',
			array(),
			KOENIGTECH_CONSENT_VERSION
		);

		wp_enqueue_script(
			'koenigtech-consent',
			KOENIGTECH_CONSENT_URL . 'assets/koenig-consent.min.js',
			array(),
			KOENIGTECH_CONSENT_VERSION,
			true
		);

		$config = array(
			'projectId'            => $settings['project_id'],
			'version'              => $settings['consent_version'],
			'lang'                 => $settings['lang'],
			'fallbackLang'         => $settings['fallback_lang'],
			'privacyUrl'           => $settings['privacy_url'],
			'imprintUrl'           => $settings['imprint_url'],
			'showFloatingSettings' => '1' === $settings['show_floating_settings'],
			'services'             => array(
				'googleConsentMode' => '1' === $settings['google_consent_mode'],
				'ga4Id'             => $settings['ga4_id'],
				'googleAdsId'       => $settings['google_ads_id'],
				'gtmId'             => $settings['gtm_id'],
				'metaPixelId'       => $settings['meta_pixel_id'],
			),
		);

		wp_add_inline_script(
			'koenigtech-consent',
			'window.KoenigConsent && window.KoenigConsent.init(' . wp_json_encode( $config ) . ');'
		);
	}

	public function render_settings_link_host() {
		$settings = self::settings();

		if ( '1' !== $settings['enabled'] || '1' !== $settings['auto_footer_link'] ) {
			return;
		}

		echo '<div class="koenigtech-consent-footer-link"><span data-kt-consent-settings-link></span></div>';
	}

	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$settings = self::settings();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'KoenigTech Consent', 'koenigtech-consent' ); ?></h1>
			<p><?php esc_html_e( 'Configure the reusable KoenigTech cookie and tracking consent kit for this WordPress site.', 'koenigtech-consent' ); ?></p>
			<form method="post" action="options.php">
				<?php settings_fields( 'koenigtech_consent' ); ?>
				<table class="form-table" role="presentation">
					<?php $this->checkbox_row( 'enabled', __( 'Enable consent banner', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->text_row( 'project_id', __( 'Project ID', 'koenigtech-consent' ), $settings, 'webgrow' ); ?>
					<?php $this->text_row( 'consent_version', __( 'Consent Version', 'koenigtech-consent' ), $settings, '2026-06-09' ); ?>
					<?php $this->select_row( 'lang', __( 'Language', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->select_row( 'fallback_lang', __( 'Fallback Language', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->url_row( 'privacy_url', __( 'Privacy Policy URL', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->url_row( 'imprint_url', __( 'Legal Notice URL', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->checkbox_row( 'show_floating_settings', __( 'Show settings link after consent', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->checkbox_row( 'auto_footer_link', __( 'Add footer settings host automatically', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->checkbox_row( 'google_consent_mode', __( 'Enable Google Consent Mode', 'koenigtech-consent' ), $settings ); ?>
					<?php $this->text_row( 'ga4_id', __( 'GA4 ID', 'koenigtech-consent' ), $settings, 'G-XXXXXXXXXX' ); ?>
					<?php $this->text_row( 'google_ads_id', __( 'Google Ads ID', 'koenigtech-consent' ), $settings, 'AW-XXXXXXXXXX' ); ?>
					<?php $this->text_row( 'gtm_id', __( 'Google Tag Manager ID', 'koenigtech-consent' ), $settings, 'GTM-XXXXXXX' ); ?>
					<?php $this->text_row( 'meta_pixel_id', __( 'Meta Pixel ID', 'koenigtech-consent' ), $settings, '000000000000000' ); ?>
				</table>
				<?php submit_button(); ?>
			</form>
			<hr>
			<p>
				<?php esc_html_e( 'Manual footer link shortcode/markup:', 'koenigtech-consent' ); ?>
				<code>&lt;span data-kt-consent-settings-link&gt;&lt;/span&gt;</code>
			</p>
			<p>
				<?php esc_html_e( 'Updates are checked from GitHub Releases:', 'koenigtech-consent' ); ?>
				<a href="https://github.com/<?php echo esc_attr( KOENIGTECH_CONSENT_REPO ); ?>/releases" target="_blank" rel="noopener noreferrer">GitHub Releases</a>
			</p>
		</div>
		<?php
	}

	private function field_name( $key ) {
		return self::OPTION_KEY . '[' . $key . ']';
	}

	private function checkbox_row( $key, $label, $settings ) {
		?>
		<tr>
			<th scope="row"><?php echo esc_html( $label ); ?></th>
			<td>
				<label>
					<input type="checkbox" name="<?php echo esc_attr( $this->field_name( $key ) ); ?>" value="1" <?php checked( '1', $settings[ $key ] ?? '0' ); ?>>
					<?php esc_html_e( 'Enabled', 'koenigtech-consent' ); ?>
				</label>
			</td>
		</tr>
		<?php
	}

	private function text_row( $key, $label, $settings, $placeholder = '' ) {
		?>
		<tr>
			<th scope="row"><label for="koenigtech-consent-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<input class="regular-text" id="koenigtech-consent-<?php echo esc_attr( $key ); ?>" type="text" name="<?php echo esc_attr( $this->field_name( $key ) ); ?>" value="<?php echo esc_attr( $settings[ $key ] ?? '' ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>">
			</td>
		</tr>
		<?php
	}

	private function url_row( $key, $label, $settings ) {
		?>
		<tr>
			<th scope="row"><label for="koenigtech-consent-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<input class="regular-text code" id="koenigtech-consent-<?php echo esc_attr( $key ); ?>" type="url" name="<?php echo esc_attr( $this->field_name( $key ) ); ?>" value="<?php echo esc_attr( $settings[ $key ] ?? '' ); ?>">
			</td>
		</tr>
		<?php
	}

	private function select_row( $key, $label, $settings ) {
		$value = $settings[ $key ] ?? 'en';
		?>
		<tr>
			<th scope="row"><label for="koenigtech-consent-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<select id="koenigtech-consent-<?php echo esc_attr( $key ); ?>" name="<?php echo esc_attr( $this->field_name( $key ) ); ?>">
					<option value="de" <?php selected( 'de', $value ); ?>>Deutsch</option>
					<option value="en" <?php selected( 'en', $value ); ?>>English</option>
				</select>
			</td>
		</tr>
		<?php
	}
}
