<script lang="ts">
  let { variant = 'member' }: { variant?: 'member' | 'project' } = $props();
</script>

<span class="badge {variant}" aria-label={variant === 'project' ? 'Founding Project' : 'Founding Member'}></span>

<style>
  .badge {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }

  .member {
    background-image: url(/blue.png);
  }

  .project {
    background-image: url(/yellow.png);
  }
</style>
