{posts.map(p => (
  <div className="col" key={p.id}>
    <PostCard post={p} onView={(id) => navigate(`/posts/${id}`)} />
  </div>
))}
