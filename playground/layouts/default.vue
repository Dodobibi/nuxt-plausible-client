<template>
  <header>
    <h1>Default Layout</h1>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
        <li><NuxtLink to="/scroll">Scroll</NuxtLink></li>
        <li><NuxtLink to="/inexistant-route">Try 404</NuxtLink></li>
        <li>
          <NuxtLink
            to="http://www.google.com"
            external
            >External Google</NuxtLink
          >
        </li>
      </ul>
    </nav>
    <main>
      <slot />
    </main>
  </header>
</template>
