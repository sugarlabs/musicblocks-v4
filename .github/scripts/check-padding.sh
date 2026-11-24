#!/usr/bin/env bash
# Fails when a line added in a pull request hides code behind a long run of whitespace.
# The pattern is the one from issue #1070: 200 or more spaces or tabs, or 25 or more tabs,
# followed by more code on the same line. Only added lines are checked, never old ones.
#
# Usage: check-padding.sh <base-ref> [head-ref]

set -euo pipefail

base="${1:?usage: check-padding.sh <base-ref> [head-ref]}"
head="${2:-HEAD}"

# --unified=0 leaves only the changed lines, so every "+" line below is newly added.
git diff --unified=0 --no-color --diff-filter=ACMR "$base...$head" | perl -e '
    my ($file, $line, $hits, $in_hunk) = ("", 0, 0, 0);
    while (<STDIN>) {
        chomp;
        # "+++ b/" is a file header only before the first hunk, inside a hunk it is an
        # added line that starts with "++", and that must be checked too.
        if (/^diff --git /) { $in_hunk = 0; next; }
        if (!$in_hunk && /^\+\+\+ b\/(.*)$/) { $file = $1; next; }
        if (/^@@ -\S+ \+(\d+)/) { $line = $1; $in_hunk = 1; next; }
        if ($in_hunk && /^\+(.*)$/) {
            my $text = $1;
            if ($text =~ /[ \t]{200,}\S|\t{25,}\S/) {
                # Print the location and length only, the hidden line itself can be huge.
                printf "%s:%d: whitespace padding followed by code (line is %d characters)\n",
                    $file, $line, length($text);
                $hits++;
            }
            $line++;
        }
    }
    if ($hits) {
        print STDERR "\nFound $hits line(s) with code hidden after a long run of whitespace.\n";
        exit 1;
    }
'
