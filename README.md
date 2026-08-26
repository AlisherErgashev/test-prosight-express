## Запуск

```
npm install
cp .env.example .env
npm run dev
```

Swagger: http://localhost:3000/docs

## Логин

3 пользователя в src/auth/users.ts: admin/admin123, normal/normal123, limited/limited123.

```
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```

## Примеры запросов

```
curl "http://localhost:3000/locus?limit=3" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:3000/locus?sideloading=locusMembers&limit=3" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:3000/locus?regionId=86118093&sideloading=locusMembers" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:3000/locus?sortBy=memberCount&sortOrder=DESC&limit=5" -H "Authorization: Bearer $TOKEN"
```

## Права доступа

- admin — без ограничений
- normal — только поля rnc_locus, sideloading и фильтры regionId/membershipStatus запрещены (403)
- limited — всегда ограничен regionId in (86118093, 86696489, 88186467)

## Структура

```
src/
  index.ts        точка входа, роуты
  db.ts           TypeORM DataSource
  entities/       RncLocus, RncLocusMember
  auth/           логин + jwt middleware
  locus/          GET /locus логика
  openapi.ts      swagger-спека
```
