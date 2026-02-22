# Updating density data

The clients need valid density data in order to perform weight->volume conversions when going from metric to US customary measures.

A commandline app is provided, `update-densities`.  The source code is in [tools/update-densities](../tools/update-densities); it can be compiled with any recent
version of the Go tools.  Alternatively use one of the compiled binaries in that directory.  They can be downloaded to your system and run simply by using `chmod +x {downloaded-filename}`.

## Running the tool

- Download the right compiled binary from [tools](../tools) to match your platform
- Make sure you can run it: `chmod +x {downloaded-file-name}`
- Make sure you have Feast account credentials from Janus
- Set the profile: `export AWS_PROFILE=feast`
- Now the tool will work.  Use `./update-densities --help` to see options.
- By default, the tool targets the **CODE** environment.  If you want to target PROD, simply append `--stage PROD` to target PROD instead
- Remember, once you publish a release it's available to clients **immediately**.

## Preparing the data

This data needs to be prepared in a spreadsheet.  You need to have the following columns, in this exact order:

- integer ID
- Ingredient name
- Normalised form of the ingredient.  This is used for matching to the ingredient template strings in recipes and needs to be valid
- Density in grams per millilitre.  The library handles ml -> cup/tsp/floz etc. conversions

Any other columns to the right of this are allowed but will be ignored by the ingest process

Once you have this information, export it as a CSV.  Quoting with " and using , delimiters is recommended.

## Checking the status

Use the tool: `update-densities -list`.

You'll see an output like this:

```
The current version is 2026-02-12T15:34:08Z (prepared Thursday, 12-Feb-26 15:34:08 UTC)
https://(link-to-json)

Other versions uploaded are:
- 2026-02-03T17:55:53.978Z https://(link-to-json)
- 2026-02-03T17:57:31.388Z https://(link-to-json)
- 2026-02-03T18:00:16.046Z https://(link-to-json)
- 2026-02-12T15:34:08.809Z https://(link-to-json)
```

This tells you which version is currently active and which other versions are currently available.

## Updating

Use the tool: `update-densities -update {path-to-csv-file}`.  This will:

- transfer the data to AWS
- validate the CSV format and parse the data
- reformat to compression-friendly JSON for the app
- push that to the CDN
- update the "latest" pointer to the new version
- flush the CDN cache

Use `-list` to get the URLs to check the data is updated

## Rollback

Update didn't go as well as you thought? Userhelp complaining? You can roll back with the tool:

`update-densities --rollback {date-to-rollback}`

To find the right value for `{date-to-rollback}`, hopefully you copied down the response from `-list`
when you started.  If so, simply paste that in.  If not, or if it doesn't work, use `-list` to show all of the available upload versions.

The timestamps are all to millisecond (3 decimal place precision).  You need to use the _exact_ timestamp including milliseconds and `Z`:

`update-densities --rollback 2026-02-03T17:57:31.388Z`

The tool will:

- take the density data from the timestamp specified
- copy it over the "latest" revision
- flush the CDN cache

## Download

You can download any revision of the data in CSV form.  Simply:

```bash
update-densities --out latest.csv --download latest
```

Alternatively use any timestamp from the output of "-list" to download that version.
