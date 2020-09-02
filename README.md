# Rapid River Software's website
Helpful Sections:
- [Basic Style Guide](#basic-style-guide)
- [Contribution Guide](#contribution-guide)
- [Creating a team member profile](#creating-a-team-member-profile)
- [Creating content e.g. page/blog/casestudy](#content-quick-guides)
- [Syntax Highlighting Code in Blogs](#syntax-highlighting-for-your-code)

## Basic Style Guide
### CSS naming
- SCSS/CSS filenames should be kebab case (i.e. `kebab-case`) to match class names.
- Assume that each parent "component" should have it's own corresponding stylesheet. E.g. The `.about-page` class declaration can be found in the `_about-page.scss` file
- A parent "component" will be named with two words, separated by a hyphen. E.g. `.service-list`
- A child "component" will be named with one "word", no hyphens. E.g. `.serviceitem`
- Some out-dated classes probably exist that don't follow this convention, so those should be refactored.

### JS naming
JavaScript filenames should be camel case (i.e. `camelCase`) to match the JS object/method naming conventions.

### HTML/Jekyll Template naming
HTML/Jekyll templates should be snake case (i.e. `snake_case`) to match Jekyll/Ruby conventions.


## Contribution Guide:
- Clone this repo
- Ensure that `docker` is running
- Run `docker-compose up`

Note: if you don't see your changes showing up, stop the jekyll server, do a `jekyll clean` then start the server again.

You may find [reading about Jekyll](https://jekyllrb.com) will help also.

## Content Quick Guides
This section provides a summary of the ways different types of content can be added.

### Creating a team member profile
1. Add your details in `/data/people.yml` file
2. Put a little photo of yourself in `/assets/img/team`. Filename should match the `pic` value you provided with your details, above
3. Check that it looks good in the browser
4. Open a PR and request a review

### Creating a page
1. Add your new page in the `/pages` directory
2. Make sure to set the `permalink` of the page in the frontmatter
3. Add the page link to the top navigation

### Creating a blog post:
1. Copy an existing post in the `blog/_posts` directory, edit the file name and "front matter" accordingly
2. Get your markdown on
3. Review in the browser when done writing
4. Open a PR and request a review

### Creating case-study item:
1. Copy an existing post in the `_case_studies/` directory, edit the file name and "front matter" accordingly
2. Create an `img` and a `thumbnail` for the new case study item in the `assets/img/case-studies` directory
3. Review in the browser when done
4. Open a PR

### Syntax highlighting for your code
In your markdown, you can use a shortcode to add syntax highlighting to your code. Below is an example for JavaScript:
```javascript
{%highlight javascript %}
  function myCoolFunc() {
    let hello = "uh, hello";
    alert(hello);
  }

  myCoolFunc();
{% endhighlight %}
```
