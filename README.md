Instructions
------------

Install phantomjs
- brew install phantomjs (OsX)

Install node.js dependencies
- npm install

txlive_import_tool
------------------
This tool will extract live strings from your site and upload them to a
resource in transifex.
Run
- node txlive-import-tool.js url project_slug resource_slug username [password]

export
------------------
This tool will extract translated strings from a url and associate them
with the source strings found in another url. Two urls must have same number
of strings.
Run
- node export.js source_url translation_url jsonfile
