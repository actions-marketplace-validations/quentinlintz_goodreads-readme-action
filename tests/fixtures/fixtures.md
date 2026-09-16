# Fixtures

Test scenarios with RSS XML inputs and expected markdown outputs.

## Currently reading

Input: ./currently-reading.xml
Expected output: ./currently-reading.expected.md

- date-added descending
- ratings enabled (none)
- limit 10

## Read

Input: ./read.xml
Expected output: ./read.expected.md

- date-read descending
- ratings enabled
- limit 6

## Single book

Input: ./single-book.xml
Expected output: ./single-book.expected.md

- date-added descending
- ratings disabled
- limit 1

## Valid empty

Input: ./valid-empty.xml
Expected output: ./valid-empty.expected.md

The shelf is empty and should clear old books in the README.

## Malformed

Input: ./malformed.xml

The XML parsing fails and the README remains unchanged.

## Not RSS

Input: ./not-rss.xml

The XML response is not RSS and the README remains unchanged.
