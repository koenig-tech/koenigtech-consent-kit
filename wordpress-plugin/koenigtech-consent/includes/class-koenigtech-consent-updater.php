<?php
/**
 * GitHub release updater.
 *
 * @package KoenigTechConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class KoenigTech_Consent_Updater {
	const CACHE_KEY = 'koenigtech_consent_latest_release';

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
		add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'inject_update' ) );
		add_filter( 'plugins_api', array( $this, 'plugin_info' ), 20, 3 );
	}

	public function inject_update( $transient ) {
		if ( ! is_object( $transient ) ) {
			return $transient;
		}

		$release = $this->latest_release();
		if ( ! $release ) {
			return $transient;
		}

		$latest_version = $this->version_from_tag( $release['tag_name'] ?? '' );
		if ( ! $latest_version || ! version_compare( $latest_version, KOENIGTECH_CONSENT_VERSION, '>' ) ) {
			return $transient;
		}

		$package = $this->package_url( $release );
		if ( ! $package ) {
			return $transient;
		}

		$transient->response[ KOENIGTECH_CONSENT_BASENAME ] = (object) array(
			'id'          => KOENIGTECH_CONSENT_BASENAME,
			'slug'        => 'koenigtech-consent',
			'plugin'      => KOENIGTECH_CONSENT_BASENAME,
			'new_version' => $latest_version,
			'url'         => 'https://github.com/' . KOENIGTECH_CONSENT_REPO,
			'package'     => $package,
			'tested'      => '6.6',
		);

		return $transient;
	}

	public function plugin_info( $result, $action, $args ) {
		if ( 'plugin_information' !== $action || empty( $args->slug ) || 'koenigtech-consent' !== $args->slug ) {
			return $result;
		}

		$release = $this->latest_release();
		if ( ! $release ) {
			return $result;
		}

		$version = $this->version_from_tag( $release['tag_name'] ?? '' );
		$body    = wp_kses_post( $release['body'] ?? '' );

		return (object) array(
			'name'          => 'KoenigTech Consent',
			'slug'          => 'koenigtech-consent',
			'version'       => $version ?: KOENIGTECH_CONSENT_VERSION,
			'author'        => '<a href="https://koenigtech.de/">KoenigTech</a>',
			'homepage'      => 'https://github.com/' . KOENIGTECH_CONSENT_REPO,
			'download_link' => $this->package_url( $release ),
			'sections'      => array(
				'description' => 'Reusable cookie and tracking consent manager for KoenigTech WordPress sites.',
				'changelog'   => $body ?: 'See GitHub Releases for details.',
			),
		);
	}

	private function latest_release() {
		$cached = get_site_transient( self::CACHE_KEY );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$response = wp_remote_get(
			'https://api.github.com/repos/' . KOENIGTECH_CONSENT_REPO . '/releases/latest',
			array(
				'timeout' => 8,
				'headers' => array(
					'Accept'     => 'application/vnd.github+json',
					'User-Agent' => 'KoenigTech-Consent-WordPress/' . KOENIGTECH_CONSENT_VERSION,
				),
			)
		);

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}

		$release = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $release ) || empty( $release['tag_name'] ) ) {
			return null;
		}

		set_site_transient( self::CACHE_KEY, $release, 6 * HOUR_IN_SECONDS );

		return $release;
	}

	private function version_from_tag( $tag ) {
		$tag = ltrim( (string) $tag, 'vV' );

		return preg_match( '/^\d+\.\d+\.\d+$/', $tag ) ? $tag : '';
	}

	private function package_url( $release ) {
		foreach ( $release['assets'] ?? array() as $asset ) {
			if ( ! empty( $asset['name'] ) && 'koenigtech-consent-wordpress.zip' === $asset['name'] && ! empty( $asset['browser_download_url'] ) ) {
				return esc_url_raw( $asset['browser_download_url'] );
			}
		}

		return '';
	}
}
