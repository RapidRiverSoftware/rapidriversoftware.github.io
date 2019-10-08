Rapid River Software's website
====================

### For developers:

- Clone this repo
- `bundle install`
- `bundle exec jekyll serve`

Note: if you don't see your changes showing up, stop the jekyll server, do a `jekyll clean` then start the server again.

You may find [reading about Jekyll](https://jekyllrb.com) will help also.

### To contribute:

Please open a PR and assign it to Calum for review.

## Quick Guides
This section provides a summary of the ways different types of content can be added.

### Creating a page
1. Add your new page in the `/pages` directory
2. Make sure to set the `permalink` of the page in the frontmatter
3. Add the page link to the top navigation

### To create a blog post:

1. Copy an existing post in the `blog/_posts` directory, edit the file name and "front matter" accordingly.
2. Get your markdown on.
3. Review in the browser when done writing.
4. Open a PR.

### To create a case-study item:
1. Copy an existing post in the `_case_studies/` directory, edit the file name and "front matter" accordingly
2. Create an `img` and a `thumbnail` for the new case study item in the `img/case-studies` directory
3. Review in the browser when done
4. Open a PR
