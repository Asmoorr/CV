## Purpose

Обеспечить поисковым системам однозначные, локализованные и проверяемые сигналы о страницах резюме, а владельцу — устойчивую основу для измеримого роста органической видимости.

## ADDED Requirements

### Requirement: Canonical public origin
Система SHALL формировать все абсолютные SEO URL из одного явно настроенного HTTPS origin production-сайта и SHALL не публиковать localhost, preview-host или смешанные домены в production metadata.

#### Scenario: Production origin configured
- **WHEN** production build выполняется с корректным публичным origin
- **THEN** canonical, hreflang, sitemap, Open Graph и JSON-LD используют этот origin без расхождений

#### Scenario: Production origin is invalid or absent
- **WHEN** production build выполняется без валидного HTTPS origin
- **THEN** проверка конфигурации завершается ошибкой до публикации SEO-артефактов с некорректными URL

### Requirement: Localized page identity
Каждая индексируемая страница `/ru` и `/en` SHALL отдавать в исходном HTML уникальные для локали title и description, self-referencing canonical, взаимные `hreflang` для `ru` и `en`, а также `x-default`, ведущий на предпочтительную русскую версию.

#### Scenario: Russian page metadata
- **WHEN** crawler запрашивает `/ru`
- **THEN** HTML имеет `lang="ru"`, русский title и description, canonical `/ru` и альтернативы `ru`, `en`, `x-default`

#### Scenario: English page metadata
- **WHEN** crawler запрашивает `/en`
- **THEN** HTML имеет `lang="en"`, английский title и description, canonical `/en` и тот же взаимно согласованный набор альтернатив

#### Scenario: Metadata without client execution
- **WHEN** документ анализируется без выполнения клиентского JavaScript
- **THEN** все критические title, description, canonical, hreflang и robots directives присутствуют в HTML

### Requirement: Search crawler discovery
Система SHALL публиковать валидные `/robots.txt` и `/sitemap.xml`; sitemap SHALL содержать только индексируемые canonical URL `/ru` и `/en` с взаимными языковыми альтернативами, а robots SHALL разрешать обход публичного сайта и ссылаться на абсолютный sitemap URL.

#### Scenario: Sitemap is requested
- **WHEN** crawler запрашивает `/sitemap.xml`
- **THEN** ответ успешен, содержит ровно актуальные canonical страницы и согласованные `hreflang` URL без фрагментов, redirect URL или preview URL

#### Scenario: Robots is requested
- **WHEN** crawler запрашивает `/robots.txt`
- **THEN** ответ успешен, разрешает обход индексируемых маршрутов и содержит ссылку на `/sitemap.xml` текущего production origin

#### Scenario: Root URL is requested
- **WHEN** crawler или пользователь запрашивает `/`
- **THEN** система перенаправляет на `/ru`, а `/` не объявляется отдельной canonical страницей в sitemap

### Requirement: Structured person profile
Каждая локализованная страница SHALL содержать синтаксически валидный JSON-LD граф с `ProfilePage` и основной сущностью `Person`; свойства SHALL быть согласованы с видимым контентом, canonical URL и локалью и SHALL включать только подтверждённые факты и реальные внешние профили.

#### Scenario: Structured data validation
- **WHEN** JSON-LD извлекается из `/ru` или `/en`
- **THEN** он разбирается как JSON, содержит устойчивые `@id`, локализованные name/description/url и не содержит placeholder, выдуманных рейтингов, навыков или работодателей

#### Scenario: Unsafe content serialization
- **WHEN** строковое поле structured data содержит символ `<`
- **THEN** сериализованный JSON-LD экранирует его и не позволяет закрыть script element

### Requirement: Search and social presentation
Каждая локализованная страница SHALL предоставлять согласованные Open Graph и Twitter Card данные с абсолютным canonical URL, локализованными title/description, корректной locale-связью и доступным для crawler брендированным изображением рекомендуемого social-preview формата.

#### Scenario: Link preview metadata
- **WHEN** social crawler запрашивает локализованную страницу
- **THEN** он получает абсолютные URL, локализованные тексты, тип `profile` или наиболее близкий поддерживаемый тип и изображение с объявленными размерами и alt-текстом

### Requirement: Human-first relevant content
Видимый RU/EN-контент SHALL ясно описывать имя, профессиональную роль, специализацию, ключевые технологии, подтверждённый опыт и результаты естественным языком; семантически эквивалентные поля SHALL быть структурно согласованы между локалями.

#### Scenario: Primary topic is understandable
- **WHEN** поисковая система или пользователь читает страницу сверху вниз
- **THEN** единственный основной заголовок называет человека, а непосредственно связанный видимый текст однозначно сообщает профессиональную роль и профиль компетенций

#### Scenario: Content remains truthful and readable
- **WHEN** SEO-текст проходит редакционную проверку
- **THEN** каждое утверждение подтверждено данными резюме, текст не содержит скрытых ключевых слов, повторов ради частотности или контента только для crawler

### Requirement: Technical quality budget
Опубликованные страницы SHALL сохранять серверно отрендеренный основной контент, корректную семантическую иерархию, доступные crawlable links и отсутствие SEO-регрессий; целевой field-бюджет Core Web Vitals SHALL быть LCP ≤ 2.5 s, INP ≤ 200 ms и CLS ≤ 0.1 на 75-м перцентиле мобильных и настольных посещений при наличии достаточных данных.

#### Scenario: Automated SEO regression check
- **WHEN** выполняются проверки production build
- **THEN** они подтверждают indexable status, один H1, непустой видимый основной контент, корректные metadata/canonical/hreflang, robots, sitemap, JSON-LD и отсутствие битых внутренних ссылок

#### Scenario: Field data is insufficient
- **WHEN** трафика недостаточно для репрезентативного 75-го перцентиля
- **THEN** команда использует лабораторный baseline только как диагностический сигнал и не выдаёт его за полевые Core Web Vitals

### Requirement: Post-release search measurement
Владелец SHALL иметь документированный процесс подтверждения сайта, отправки sitemap и измерения индексирования, запросов, показов, кликов, CTR, позиции и Core Web Vitals в Google Search Console и Bing Webmaster Tools без хранения verification secrets в исходном коде.

#### Scenario: SEO release is completed
- **WHEN** production URL опубликован и доступ подтверждён
- **THEN** sitemap отправлен в подключённые кабинеты, обе canonical страницы проверены инспекцией URL, а исходный baseline метрик зафиксирован с датой

#### Scenario: SEO impact is reviewed
- **WHEN** после переиндексации накоплен сопоставимый период данных
- **THEN** показатели сравниваются по локали и запросу с baseline, а дальнейшие контентные изменения принимаются по данным, а не по гарантии позиции

