#!/bin/sh

OUTPUT_FILE="LICENSE-3RD-PARTY.txt"
TMP_FILE="$OUTPUT_FILE.tmp"

rm $OUTPUT_FILE

./node_modules/.bin/generate-license-file --input package-lock.json --output $TMP_FILE

echo """Favicon created using 'Seats icons created by Made by Made Premium - Flaticon'

-----------

The original "Ausschusskalkulator", available here:
https://www.verwaltungsinformatiker.de/de/werkzeugkasten.html

It contains the following license and notice below:

Ausschuss-Kalkulator für bayer. Kommunalorgane

Copyright (C) 2019  Jan Friedrich und Peter Raithel
(Hochschullehrer an der Hochschule für den öffentlichen Dienst in Bayern)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see https://www.gnu.org/licenses.

-----------
""" >> $OUTPUT_FILE

cat $TMP_FILE >> $OUTPUT_FILE

rm $TMP_FILE
