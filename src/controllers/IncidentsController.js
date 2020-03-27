const connection = require('../database/connection') 

module.exports = {
    async index (request, response) {
        const { page = 1 } = request.query;

        const [count] = await connection('incidents').count(); // [] em volta da variavel é sinal de pegar so o primeiro valor do array que a connection busca no db


        const incidents = await connection('incidents')
        .join('ongs', 'ong_id', '=', 'incidents.ong_id')
        .limit(5)
        .offset((page - 1) * 5)
        .select(['incidents.*'], 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.uf');
        
        response.header('X-total-casos', count['count(*)']);
        return response.json(incidents);
    },

    async create(request, response){
        const {titulo, descricao, valor} = request.body;
        const ong_id = request.headers.autorizacao;

        const [id] = await connection('incidents').insert({
            titulo,
            descricao,
            valor,
            ong_id,
        });
        return response.json({ id });
    },
    async delete(request, response){
        const {id} = request.params;
        const ong_id = request.headers.autorizacao;

        const incidents = await connection('incidents').where('id', id).select('ong_id').first();

        if (incidents.ong_id !== ong_id){
            return response.status(401).json({ error: 'Voce n tem permissão'});
        } 
        await connection('incidents').where('id', id).delete();
        return response.status(204).send(); //status 204 enviar resposta para front sem conteudo. // send() enviar a resposta sem body, vazia.
    }
}