import Response from 'ember-cli-mirage/response';

import summaryFixture from '../mirage/fixtures/summary';
import searchFixture from '../mirage/fixtures/search';
import categoriesFixture from '../mirage/fixtures/categories';
import crateFixture from '../mirage/fixtures/crate';
import crateVersionsFixture from '../mirage/fixtures/crate_versions';
import crateAuthorsFixture from '../mirage/fixtures/crate_authors';
import crateOwnersFixture from '../mirage/fixtures/crate_owners';
import crateTeamsFixture from '../mirage/fixtures/crate_teams';
import crateReverseDependenciesFixture from '../mirage/fixtures/crate_reverse_dependencies';
import crateDependenciesFixture from '../mirage/fixtures/crate_dependencies';
import crateDownloadsFixture from '../mirage/fixtures/crate_downloads';

export default function() {
    this.get('/summary', () => summaryFixture);

    this.namespace = '/api/v1';

    this.get('/crates', (schema, request) => {
        const { start, end } = pageParams(request);
        const payload = {
            crates: searchFixture.crates.slice(start, end),
            meta: searchFixture.meta,
        };

        if (request.queryParams.team_id) {
            let teamId = request.queryParams.team_id;
            payload.user = schema.teams.find(teamId);

        } else if (request.queryParams.user_id) {
            let userId = request.queryParams.user_id;
            payload.user = schema.users.find(userId);
        }

        return payload;
    });

    this.get('/categories', () => categoriesFixture);

    this.get('/crates/nanomsg', () => crateFixture);
    this.get('/crates/nanomsg/versions', () => crateVersionsFixture);
    this.get('/crates/nanomsg/:version_num/authors', () => crateAuthorsFixture);
    this.get('/crates/nanomsg/owner_user', () => crateOwnersFixture);
    this.get('/crates/nanomsg/owner_team', () => crateTeamsFixture);
    this.get('/crates/nanomsg/reverse_dependencies', () => crateReverseDependenciesFixture);
    this.get('/crates/nanomsg/:version_num/dependencies', () => crateDependenciesFixture);
    this.get('/crates/nanomsg/downloads', () => crateDownloadsFixture);
    this.get('/crates/nanomsg/:version_num/downloads', () => crateDownloadsFixture);

    this.get('/keywords', function(schema, request) {
        let { start, end } = pageParams(request);

        let allKeywords = schema.keywords.all().sort((a, b) => a.crates_cnt - b.crates_cnt);
        let keywords = allKeywords.slice(start, end);
        let total = allKeywords.length;

        return withMeta(this.serialize(keywords), { total });
    });

    this.get('/keywords/:keyword_id', (schema, request) => {
        let keywordId = request.params.keyword_id;
        let keyword = schema.keywords.find(keywordId);
        return keyword ? keyword : notFound();
    });

    this.get('/teams/:team_id', (schema, request) => {
        let login = request.params.team_id;
        let team = schema.teams.findBy({ login });
        return team ? team : notFound();
    });

    this.get('/users/:user_id', (schema, request) => {
        let login = request.params.user_id;
        let user = schema.users.findBy({ login });
        return user ? user : notFound();
    });
}

function notFound() {
    return new Response(404, { 'Content-Type': 'application/json' }, {
        'errors': [{ 'detail': 'Not Found' }]
    });
}

function pageParams(request) {
    const { queryParams } = request;

    const page = parseInt(queryParams.page);
    const perPage = parseInt(queryParams.per_page);

    const start = (page - 1) * perPage;
    const end = start + perPage;

    return { page, perPage, start, end };
}

function withMeta(response, meta) {
    response.meta = meta;
    return response;
}
