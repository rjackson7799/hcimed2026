import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { pageSEO } from '@/config/seo';
import { PageHero } from '@/components/PageHero';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilterBar } from '@/components/blog/BlogFilterBar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { getAllPosts, getPostsByCategory, getPostsByTag } from '@/lib/blog';
import type { BlogCategory } from '@/types/blog';
import { FileText } from 'lucide-react';

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as BlogCategory | null;
  const tagParam = searchParams.get('tag');
  const page = Math.max(1, Number(searchParams.get('page') || '1'));

  let posts = getAllPosts();

  if (categoryParam) {
    posts = getPostsByCategory(categoryParam);
  } else if (tagParam) {
    posts = getPostsByTag(tagParam);
  }

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  return (
    <Layout>
      <SEO {...pageSEO.blog} />
      <PageHero
        title="Health Resources"
        subtitle="Health tips, medical insights, and wellness information from our team"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <BlogFilterBar />

          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
              <BlogPagination currentPage={page} totalPages={totalPages} />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                {categoryParam || tagParam ? 'No Matching Articles' : 'Coming Soon'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {categoryParam || tagParam
                  ? 'No articles found for this filter. Try a different category or tag.'
                  : "We're working on bringing you helpful health resources and articles. Check back soon for updates from our medical team."}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
