import {defineConfig} from 'vitepress'
import * as fs from 'node:fs';

function latestVersion() {
    return '2.1';
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Froxlor Documentation",
    description: "Froxlor is the lightweight server management software for your needs.",

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config

        logo: '/logo_wrench.png',

        nav: versionLinks('2.1'),
        sidebar: {
            '/v2.1/': {base: '/v2.1/', items: navbar21()},
            '/v2.0/': {base: '/v2.0/', items: navbar20()}
        },

        socialLinks: [
            {icon: 'github', link: 'https://github.com/Froxlor/Froxlor'},
            {icon: 'discord', link: 'https://discord.froxlor.org/'},
        ],

        footer: {
            message: 'Except as otherwise noted, the content of this page is licensed under the <a href="https://creativecommons.org/licenses/by/4.0/" class="footer-link" rel="noopener noreferrer" target="_blank">Creative Commons Attribution 4.0 License</a>, and code samples are licensed under the <a href="https://opensource.org/licenses/MIT" class="footer-link" rel="noopener noreferrer" target="_blank">MIT</a>.',
            copyright: 'Copyright © 2022-present Team & contributors'
        },

        editLink: {
            pattern: 'https://github.com/Froxlor/Documentation/edit/main/:path',
            text: 'Edit this page on GitHub'
        },

        lastUpdated: {
            text: 'Updated at'
        },

        search: {
            provider: 'local'
        }
    }
});

function navbar21() {
    return [{
        text: '1. General',
        collapsed: false,
        link: '/general/',
        items: [
            {
                text: 'Installation',
                link: '/general/installation/',
                items: [
                    {
                        text: 'Manual (tarball)',
                        link: '/general/installation/tarball.md'
                    },
                    {
                        text: 'Debian/Ubuntu',
                        link: '/general/installation/apt-package.md'
                    },
                    {
                        text: 'Git (developer)',
                        link: '/general/installation/source.md'
                    },
                ]
            },
            {
                text: 'Update Guide',
                link: '/general/update-guide.md'
            },
            {
                text: 'Migration Guide',
                link: '/general/migration-guide.md'
            },
            {
                text: 'Uninstall',
                link: '/general/uninstall.md'
            },
        ]
    }, {
        text: '2. Admin Guide',
        collapsed: true,
        link: '/admin-guide/',
        items: [
            {
                text: 'Configuration',
                link: '/admin-guide/configuration/',
                items: [
                    {
                        text: 'PHP-FPM',
                        link: '/admin-guide/configuration/php-fpm/'
                    },
                    {
                        text: 'FCGID',
                        link: '/admin-guide/configuration/fcgid/'
                    }
                ]
            },
            {
                text: 'Settings',
                link: '/admin-guide/settings/'
            },
            {
                text: 'Resources',
                link: '/admin-guide/resources/',
                items: [
                    {
                        text: 'IPs & Ports',
                        link: '/admin-guide/resources/ips-and-ports/'
                    },
                    {
                        text: 'Admins / Resellers',
                        link: '/admin-guide/resources/admins-resellers/'
                    },
                    {
                        text: 'Customers',
                        link: '/admin-guide/resources/customers/'
                    },
                    {
                        text: 'Domains',
                        link: '/admin-guide/resources/domains/'
                    },
                    {
                        text: 'MySQL Servers',
                        link: '/admin-guide/resources/mysql-servers/'
                    },
                    {
                        text: 'Hosting Plans',
                        link: '/admin-guide/resources/hosting-plans/'
                    },
                    {
                        text: 'SSL Certificates',
                        link: '/admin-guide/resources/ssl-certificates/'
                    }
                ]
            },
            {
                text: 'PHP Configurations',
                link: '/admin-guide/php-versions-and-configuration/'
            },
            {
                text: 'Miscellaneous',
                link: '/admin-guide/miscellaneous/'
            },
            {
                text: 'Domain import',
                link: '/admin-guide/domain-import/'
            },
            {
                text: 'Froxlor console scripts (CLI)',
                link: '/admin-guide/cli-scripts/'
            },
        ]
    },
        {
            text: '3. User Guide',
            collapsed: true,
            link: '/user-guide/',
            items: [
                {
                    text: 'E-Mails',
                    link: '/user-guide/emails/',
                },
                {
                    text: 'Databases (MySQL)',
                    link: '/user-guide/databases/'
                },
                {
                    text: 'Domains / Subdomains',
                    link: '/user-guide/domains/'
                },
                {
                    text: 'FTP Accounts',
                    link: '/user-guide/ftp-accounts/'
                },
                {
                    text: 'Extras',
                    link: '/user-guide/extras/'
                },
                {
                    text: 'Traffic',
                    link: '/user-guide/traffic/'
                },
            ]
        },
        {
            text: '4. API Guide',
            collapsed: true,
            link: '/api-guide/',
            items: [
                getChildren('/v2.1/api-guide/commands', 'Commands')
            ]
        },
        {
            text: '5. Security',
            link: '/security/'
        },
        {
            text: '6. Contribution',
            link: '/contribution/'
        }
    ];

}

function navbar20() {
    return [
        {
            text: '1. General',
            collapsed: false,
            link: '/general/',
            items: [
                {
                    text: 'Installation',
                    link: '/general/installation/',
                    items: [
                        {
                            text: 'Manual (tarball)',
                            link: '/general/installation/tarball.md'
                        },
                        {
                            text: 'Debian/Ubuntu',
                            link: '/general/installation/apt-package.md'
                        },
                        {
                            text: 'Git (developer)',
                            link: '/general/installation/source.md'
                        },
                    ]
                },
                {
                    text: 'Update Guide',
                    link: '/general/update-guide.md'
                },
                {
                    text: 'Migration Guide',
                    link: '/general/migration-guide.md'
                },
                {
                    text: 'Uninstall',
                    link: '/general/uninstall.md'
                },
            ]
        },
        {
            text: '2. Admin Guide',
            collapsed: true,
            link: '/admin-guide/',
            items: [
                {
                    text: 'Configuration',
                    link: '/admin-guide/configuration/',
                    items: [
                        {
                            text: 'PHP-FPM',
                            link: '/admin-guide/configuration/php-fpm/'
                        },
                        {
                            text: 'FCGID',
                            link: '/admin-guide/configuration/fcgid/'
                        }
                    ]
                },
                {
                    text: 'Settings',
                    link: '/admin-guide/settings/'
                },
                {
                    text: 'Resources',
                    link: '/admin-guide/resources/',
                    items: [
                        {
                            text: 'IPs & Ports',
                            link: '/admin-guide/resources/ips-and-ports/'
                        },
                        {
                            text: 'Admins / Resellers',
                            link: '/admin-guide/resources/admins-resellers/'
                        },
                        {
                            text: 'Customers',
                            link: '/admin-guide/resources/customers/'
                        },
                        {
                            text: 'Domains',
                            link: '/admin-guide/resources/domains/'
                        },
                        {
                            text: 'MySQL Servers',
                            link: '/admin-guide/resources/mysql-servers/'
                        },
                        {
                            text: 'Hosting Plans',
                            link: '/admin-guide/resources/hosting-plans/'
                        },
                        {
                            text: 'SSL Certificates',
                            link: '/admin-guide/resources/ssl-certificates/'
                        }
                    ]
                },
                {
                    text: 'PHP Configurations',
                    link: '/admin-guide/php-versions-and-configuration/'
                },
                {
                    text: 'Miscellaneous',
                    link: '/admin-guide/miscellaneous/'
                },
                {
                    text: 'Domain import',
                    link: '/admin-guide/domain-import/'
                },
                {
                    text: 'Froxlor console scripts (CLI)',
                    link: '/admin-guide/cli-scripts/'
                },
            ]
        },
        {
            text: '3. User Guide',
            collapsed: true,
            link: '/user-guide/',
            items: [
                {
                    text: 'E-Mails',
                    link: '/user-guide/emails/',
                },
                {
                    text: 'Databases (MySQL)',
                    link: '/user-guide/databases/'
                },
                {
                    text: 'Domains / Subdomains',
                    link: '/user-guide/domains/'
                },
                {
                    text: 'FTP Accounts',
                    link: '/user-guide/ftp-accounts/'
                },
                {
                    text: 'Extras',
                    link: '/user-guide/extras/'
                },
                {
                    text: 'Traffic',
                    link: '/user-guide/traffic/'
                },
            ]
        },
        {
            text: '4. API Guide',
            collapsed: true,
            link: '/api-guide/',
            items: [
                getChildren('/v2.0/api-guide/commands', 'Commands')
            ]
        },
        {
            text: '5. Security',
            link: '/security/'
        },
        {
            text: '6. Contribution',
            link: '/contribution/'
        }
    ];
}

function versionLinks(myversion: string) {
    const home = [];
    const items = [];
    const dirs = fs
        .readdirSync(`./`, {withFileTypes: true})
        .filter(
            (item) =>
                item.isDirectory() &&
                item.name.toLowerCase().startsWith("v")
        );
    home.push({text: 'Home', link: '/v' + myversion + '/'});
    dirs.forEach((element) => {
        items.push({
            text: element.name + ((element.name == 'v' + latestVersion()) ? ' (latest)' : ''),
            link: '/' + element.name + '/'
        })
    });
    if (myversion == latestVersion()) {
        myversion += ' (latest)'
    }
    // @todo show current selected in main-nav-menu correctly
    home.push({text: myversion, items: [...items]});
    return home;
}

function getChildren(folder, text) {
    const children = [];
    const files = fs
        .readdirSync(`.${folder}`, {withFileTypes: true})
        .filter(
            (item) =>
                item.isFile() &&
                item.name.toLowerCase().endsWith(".md") &&
                item.name.toLowerCase() !== "readme.md"
        );

    files.forEach((element) => {
        const data = fs.readFileSync(`.${folder}/${element.name}`, 'utf8');
        children.push({text: getMdTitle(data), link: `${folder}/${element.name}`, items: []})
    });
    return {text: text, items: [...children], collapsed: true};
}

function getMdTitle(md) {
    if (!md) return "";
    let tokens = md.split("\n");
    for (let i = 0; i < tokens.length; i++) {
        if (/^#\s+.+/.test(tokens[i])) return tokens[i].substring(2);
    }
    return "missing-header-in-docfile";
}
