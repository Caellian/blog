---
title: "Hello Blog"
summary: "Details on how I set up my blog."
toot: "111688364396578489"
tags:
  - SEO
  - Svelte
  - CD
---

Sheer number of decisions that I faced while wanting to create an SSG blog was
tiresome. I started implementing it at least 5 different ways already and
finally settled for the current one because I wanted to have a place to write
down my ideas more than I cared for it to be 100% perfect.

I initially planned on using
[`pulldown_cmark`](https://github.com/raphlinus/pulldown-cmark) for Markdown
processing as it's blazingly fast, but given that I'm likely to have at most ~1k
posts here and that this website is built via Cloudflare workers, performance
isn't really _that_ much of an issue.

Extensions I had in mind were mostly along the lines of adding static
[`mermaid`](https://mermaid.js.org/)-like diagrams and
[`graphviz`](https://www.graphviz.org/) graphs so that browsers with JS disabled
(and terminal based ones) can still view figures I include.

I ended up using [`mdsvex`](https://mdsvex.pngwn.io/) like Josh Collinsworth
described in his ["Let's learn SvelteKit by building a static Markdown blog from
scratch"](https://joshcollinsworth.com/blog/build-static-sveltekit-markdown-blog)
article which documents the whole process in great detail and he's been keeping
his article up-to-date for 2 years now so I recommend it if you want to do
something similar.

## Additions

### Markdown content

I ended up extending generated HTML by dynamically generating line numbers and
optionally providing a copy button:

```js
//#! copy
async function addCopy() {
    let marked = article.querySelectorAll(
        'div[data-copy]+pre:has(code[class*="language-"])'
    );
    for (const pre of marked) {
        pre.previousElementSibling.remove();
        let content = pre.querySelector('code[class*="language-"]').innerText;
        new CopyButton({
            target: pre,
            props: {
                content, // not used in this case
            },
        });
        // Wait for the DOM to update
        requestAnimationFrame(() => {
            let button = pre.querySelector("button.copy");
            button.onclick = () => {
                navigator.clipboard.writeText(content);
            };
        });
    }
}

function addLineNumbers() {
    let codes = article.querySelectorAll("pre>code");
    for (const code of codes) {
        let lines = code.innerText.split("\n");
        let line_count = lines.length;
        let max_width = line_count.toString().length;
        let line_numbers = "";
        for (let i = 1; i <= line_count; i++) {
            let padded = i.toString().padStart(max_width, "0");
            line_numbers += `<span class="line-number">${padded}</span>`;
        }
        let pre = code.parentElement;
        pre.innerHTML =
            `<span class="line-numbers">${line_numbers}</span>` + pre.innerHTML;
    }
}
```

I don't mind that sort of stuff being dynamic as it doesn't cause the website to
break if JS is disabled. I really struggle defending myself against the intrusive thoughts of revendoring mdsvex improving that part - might be a FOSS contribution in the future. 

### Continuous Delivery

At least a semi-functional CD pipeline is a must for anyone not willing to waste
literal hours of their time doing menial and repetitive tasks.

Cloudflare now [supports building Svelte
projects](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-site/)
so I had to cleanup old plumming first. This was a win as I won't have to
maintain a separate branch for the served project files in the future. 🎉

I added a GitHub workflow that automatically updates the
[blog](https://github.com/Caellian/blog)
[submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) in the
[portfolio repo](https://github.com/Caellian/caellian.github.io) with latest
posts once I push to the `main` branch. This workflow in turn triggers the
Cloudflare worker.

All that is to say that I basically have a very convenient
[CMS](https://en.wikipedia.org/wiki/Content_management_system), that's versioned
through git, and stores data in raw text files I can migrate at any point,
completely free of charge. Served content is completely static as well so I have
to do next to no [SEO
optimization](https://en.wikipedia.org/wiki/Search_engine_optimization) and it
loads blazingly fast.

Using Rust for the blog would've probably provided somewhat faster update times,
but given that it takes less than 5 minutes for the website to build and publish
I think going with Rust would not have been worth the effort. I would've also
rewritten majority of [`zola`](https://www.getzola.org/) functionality from
ground up, which is a pattern I'm trying to avoid.

In the end, replacing the old CD pipeline with the new one took about half an
hour and will save me a lot of time in the long run. Cloudflare hosting for
static content is completely free so I end up only having to pay for a domain
name.

### Mastodon chat

Based on the idea I got from Daniel Martínez's article ["Mastodon as comment
system for your static
blog"](https://danielpecos.com/2022/12/25/mastodon-as-comment-system-for-your-static-blog/)
I also integrated Mastodon chat into blog pages.

I reworked some parts of it as I wanted to utilize Svelte for composition, use
my own icon system, and style comments differently. Nonetheless, his web
component was a huge help getting this part working as it would've took one
additional day to do it from scratch.

I extended the functionality of his web component by adding [dynamic toot
lookup](https://github.com/Caellian/caellian.github.io/blob/e7e057bc5de2db9edbe1b60c968050b38d371f49/src/components/Comments.svelte#L19)
so I don't have to update the post and rebuild the website in order to attach
appropriate responses to each article. This was important as I don't have
incremental content compilation for the blog so even a tiny metadata change
currently spins up the whole CD pipeline (which, while free, is bad for the
environment).

Having my chat section hosted on a decantralized platform is a bit messy as it
complicates moderation a bit, but it's not a huge issue to deal with as
moderation is now delegated to people other than just me, I'm not responsible
for dynamically mirroring content hosted by a third party and I can add
realatively easily add blacklisting if the need arises at some point.

## Future Improvements

### Search

This is a large topic in of itself. There's no need for search as of now because I don't have enough content for it to be useful yet.

Ideally I'd like a WASM module that uses something as fast but better quality
than XOR filters. [`tinysearch`](https://github.com/tinysearch/tinysearch) is
currently one of my top contendors in static website search space though it _is_
using XOR filters. I really don't like pure JS solutions for this, because
they're suuuper slow in comparison. That's not noticeable with 1-20 posts, but
it becomes apparent with more.

### Typed Content

Given that the svx files can provide arbitrary metadata, an idea that I had while developing the blog was to add support for `type`d posts in order to allow me to share different types of content.

If `type` is something other than `post`, the website could handle the metadata differently.

For instance:
```yaml
type: video
title: USS Inverness
summary: "A really cool USS Inverness model showcase I found."
date: "2024-01-01"
link: https://peertube.tv/w/eQh6M1F7BQnkKZW6ZYerpK
```

So the above would be shown as an embed on the website, offering direct access
for those following the RSS stream. Conversely, writing a blog post featuring a
single video with maybe a one sentence comment attached doesn't seem as
appealing.

The reason I want to do this is I often find very cool and useful resources I'd
rather share than reiterate. For instance, writing a post describing how to
setup a static blog from scratch would've been a worse decision than linking a
better (maintained) one.

## Issues

An annoyance I find with my current approach is that I basically have to extend
Markdown syntax via JS which is I guess technically quicker to do than modifying
Rust code. That being said, I did spend an hour or so trying to get code block
copy button to work 😄 (though I expect that to be an exception).

The only issue with `mdsvex` defaults I found so far is that the library it uses
for code block tokenization ([`prismjs`](https://github.com/PrismJS/prism)) does
poorer job than [`treesitter`](https://tree-sitter.github.io/tree-sitter/).

Processed content also doesn't have caching so this approach doesn't scale well
for large platforms. I'll deal with that once I reach the 100+ post mark - I
don't expect few posts I write throughout the year to cause large delays in
deployment. So it's an acceptable tradeoff between convenience and CD
performance.
