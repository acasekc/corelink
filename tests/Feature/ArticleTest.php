<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected ArticleCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->category = ArticleCategory::factory()->create();
    }

    // ========== INDEX (LIST) TESTS ==========

    public function test_admin_can_list_all_articles(): void
    {
        Article::factory(3)->create(['article_category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/articles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'slug',
                        'status',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'total',
                    'per_page',
                    'last_page',
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_non_admin_cannot_list_articles(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/articles');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_list_articles(): void
    {
        $response = $this->getJson('/api/articles');

        $response->assertStatus(401);
    }

    public function test_can_filter_articles_by_status(): void
    {
        Article::factory(2)->create(['status' => 'draft', 'article_category_id' => $this->category->id]);
        Article::factory(1)->create(['status' => 'published', 'article_category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/articles?status=draft');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_filter_articles_by_category(): void
    {
        $category1 = ArticleCategory::factory()->create();
        $category2 = ArticleCategory::factory()->create();

        Article::factory(2)->create(['article_category_id' => $category1->id]);
        Article::factory(1)->create(['article_category_id' => $category2->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/articles?category_id={$category1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_search_articles(): void
    {
        Article::factory()->create([
            'title' => 'Laravel Tutorial',
            'article_category_id' => $this->category->id,
        ]);
        Article::factory()->create([
            'title' => 'Vue Guide',
            'article_category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/articles?search=Laravel');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Laravel Tutorial');
    }

    // ========== STORE (CREATE) TESTS ==========

    public function test_admin_can_create_article(): void
    {
        $data = [
            'title' => 'New Article',
            'content' => 'Article content here',
            'status' => 'draft',
            'article_category_id' => $this->category->id,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/articles', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'slug',
                    'content',
                    'status',
                    'created_at',
                ],
            ])
            ->assertJsonPath('data.title', 'New Article')
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('articles', [
            'title' => 'New Article',
            'status' => 'draft',
        ]);
    }

    public function test_create_article_requires_title(): void
    {
        $data = [
            'content' => 'Article content',
            'status' => 'draft',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/articles', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_create_article_requires_content(): void
    {
        $data = [
            'title' => 'Article Title',
            'status' => 'draft',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/articles', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_create_article_requires_status(): void
    {
        $data = [
            'title' => 'Article Title',
            'content' => 'Content',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/articles', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_create_article_validates_status_enum(): void
    {
        $data = [
            'title' => 'Article Title',
            'content' => 'Content',
            'status' => 'invalid_status',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/articles', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_non_admin_cannot_create_article(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/articles', [
                'title' => 'Article',
                'content' => 'Content',
                'status' => 'draft',
            ]);

        $response->assertStatus(403);
    }

    // ========== SHOW (GET SINGLE) TESTS ==========

    public function test_admin_can_view_article(): void
    {
        $article = Article::factory()->create(['article_category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/articles/{$article->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'slug',
                    'content',
                    'status',
                    'category',
                    'created_at',
                ],
            ])
            ->assertJsonPath('data.id', $article->id)
            ->assertJsonPath('data.title', $article->title);
    }

    public function test_non_admin_cannot_view_article(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create();

        $response = $this->actingAs($user)
            ->getJson("/api/articles/{$article->id}");

        $response->assertStatus(403);
    }

    public function test_view_nonexistent_article_returns_404(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/articles/999');

        $response->assertStatus(404);
    }

    // ========== UPDATE TESTS ==========

    public function test_admin_can_update_article(): void
    {
        $article = Article::factory()->create(['article_category_id' => $this->category->id]);

        $data = [
            'title' => 'Updated Title',
            'content' => 'Updated content',
        ];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/articles/{$article->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.content', 'Updated content');

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_update_article_validates_status(): void
    {
        $article = Article::factory()->create();

        $data = ['status' => 'invalid_status'];

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/articles/{$article->id}", $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_non_admin_cannot_update_article(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create();

        $response = $this->actingAs($user)
            ->patchJson("/api/articles/{$article->id}", ['title' => 'New Title']);

        $response->assertStatus(403);
    }

    // ========== DELETE TESTS ==========

    public function test_admin_can_delete_article(): void
    {
        $article = Article::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('articles', ['id' => $article->id]);
    }

    public function test_non_admin_cannot_delete_article(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(403);
    }

    // ========== SPECIAL OPERATIONS ==========

    public function test_admin_can_publish_article(): void
    {
        $article = Article::factory()->create([
            'status' => 'draft',
            'article_category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/articles/{$article->id}/publish");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'status' => 'published',
        ]);
    }

    public function test_admin_can_schedule_article(): void
    {
        $article = Article::factory()->create([
            'status' => 'draft',
            'article_category_id' => $this->category->id,
        ]);

        $publishDate = now()->addDays(7)->format('Y-m-d\TH:i:s');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/articles/{$article->id}/schedule", [
                'auto_publish_at' => $publishDate,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'auto_publish_at' => $publishDate,
        ]);
    }
}
