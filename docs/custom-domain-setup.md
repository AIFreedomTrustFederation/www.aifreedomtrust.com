# Custom domain setup

Intended canonical URL: https://aifreedomtrust.com/

Repository metadata, robots.txt and sitemap.xml use this intended URL. This does not prove that the custom domain is serving the site.

## Unverified deployment settings

The connector cannot read or modify the Pages settings endpoint. Confirm Settings > Pages publishing source before adding a CNAME file. For branch publishing from main / (root), set the custom domain to aifreedomtrust.com, which creates CNAME. For a custom Actions deployment, configure the custom domain in Pages settings; CNAME is ignored.

Verify the domain in the owning GitHub account before configuring DNS. The repository owner is a user account, not an organization. Use the verification TXT value GitHub supplies; do not invent one.

## DNS target

| Name | Type | Value |
| --- | --- | --- |
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| @ | A | 185.199.110.153 |
| @ | A | 185.199.111.153 |
| www | CNAME | aifreedomtrustfederation.github.io |

Preserve unrelated mail and verification records. Confirm existing hosting before replacing web records. Enable Enforce HTTPS once the certificate is available. Verify www redirects to the apex and homepage, robots.txt, sitemap.xml and pages.html return successful HTTPS responses.

GitHub documentation: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Security limits

The referrer meta policy is set in both HTML pages. HSTS, X-Content-Type-Options and Permissions-Policy require hosting response headers; repository files alone cannot set them on GitHub Pages. A restrictive CSP needs review of the Tree Explorer's external module imports and network requests before deployment.

## Network diagnosis

The execution gateway returned HTTP 502 and its DNS resolver failed. These environment failures do not establish public DNS or website downtime. Repeat DNS and HTTPS checks from an independent network.
