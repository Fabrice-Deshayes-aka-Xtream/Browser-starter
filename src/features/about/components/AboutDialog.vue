<script setup lang="ts">
import BaseDialog from '@/shared/components/BaseDialog.vue'
import { useI18n } from 'vue-i18n'
import { APP_INFO, OPEN_SOURCE_COMPONENTS } from '@/shared/appInfo'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { locale } = useI18n()
const buildDate = new Date(APP_INFO.buildDate).toLocaleDateString(locale.value)
</script>

<template>
  <BaseDialog :open="open" :title="$t('about.title')" @close="emit('close')">
    <div class="about">
      <img class="logo" src="/icons/icon-128.png" alt="" width="96" height="96" />
      <h3>Browser starter</h3>
      <p class="version">{{ $t('about.version', { version: APP_INFO.version, date: buildDate }) }}</p>
      <p>{{ $t('about.createdBy', { author: APP_INFO.author }) }}</p>
      <p class="links">
        <a :href="APP_INFO.licenseUrl" target="_blank" rel="noopener noreferrer">
          {{ $t('about.license') }}
        </a>
        <span aria-hidden="true">•</span>
        <a :href="APP_INFO.changelogUrl" target="_blank" rel="noopener noreferrer">
          {{ $t('about.changelog') }}
        </a>
      </p>
      <a class="github" :href="APP_INFO.repositoryUrl" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 16 16" width="28" height="28" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
          />
        </svg>
        GitHub
      </a>
      <a class="bmc" :href="APP_INFO.buyMeACoffeeUrl" target="_blank" rel="noopener noreferrer">
        <span aria-hidden="true">☕</span>
        {{ $t('about.buyMeACoffee') }}
      </a>
      <hr />
      <h4>{{ $t('about.components') }}</h4>
      <ul>
        <li v-for="item in OPEN_SOURCE_COMPONENTS" :key="item.name">
          <a :href="item.url" target="_blank" rel="noopener noreferrer">
            {{ item.name }} - {{ item.description }}
          </a>
        </li>
      </ul>
    </div>
  </BaseDialog>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}

.logo {
  border-radius: 20%;
}

h3 {
  margin: 0.4rem 0 0;
  font-size: 1.4rem;
}

h4 {
  margin: 0.4rem 0;
}

p {
  margin: 0;
}

.version {
  opacity: 0.6;
}

.links {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.github {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
  color: var(--text);
  font-size: 1.4rem;
  font-weight: 600;
}

.bmc {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
  padding: 0.25rem 0.75rem;
  border: 2px solid #000;
  border-radius: 6px;
  background: #ffdd00;
  color: #000;
  font-family: Cookie, cursive;
  font-size: 1.1rem;
  line-height: 1.2;
}

.bmc:hover {
  text-decoration: none;
  filter: brightness(0.95);
}

hr {
  width: 100%;
  margin: 0.8rem 0 0.4rem;
  border: 0;
  border-top: 1px solid var(--field-border);
}

ul {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
  list-style: none;
}
</style>
