import path from 'path';

import type { StartedTestContainer } from 'testcontainers';
import { GenericContainer } from 'testcontainers';

import { expect, test } from './utils/test';
import { AdminLdap } from './page-objects/admin-ldap';

test.use({ storageState: 'admin-session.json' });
test.describe('ldap test', async () => {
	let container: StartedTestContainer;

	let poAdminLdap: AdminLdap;
	test.beforeAll(async () => {
		const buildContext = path.resolve(__dirname, 'fixtures', 'ldap-client');

		container = await (await GenericContainer.fromDockerfile(buildContext).build())
			.withName('ldap-test')
			.withExposedPorts({ container: 10389, host: 389 })
			.start();
	});

	test.afterAll(async () => {
		await container.stop();
	});

	test.beforeEach(async ({ page }) => {
		poAdminLdap = new AdminLdap(page);
	});

	test('expect connection with ldap server is ok', async ({ page }) => {
		await page.goto('/admin/settings/LDAP');
		await poAdminLdap.ldapConnection.btnEnable.click();
		await poAdminLdap.ldapConnection.selectLdapServerType();
		await poAdminLdap.ldapConnection.inputLdapHost.fill('localhost');
		await poAdminLdap.ldapConnection.btnLdapReconnect.click();
		await poAdminLdap.ldapConnection.btnLoginFallBack.click();
		await poAdminLdap.ldapConnection.btnSaveChanges.click();
	});

	test('expect connection is ok', async ({ page }) => {
		await page.goto('/admin/settings/LDAP');
		await poAdminLdap.ldapConnection.btnTestConnection.click();
		await expect(poAdminLdap.toastSuccess).toBeVisible();
	});
});
