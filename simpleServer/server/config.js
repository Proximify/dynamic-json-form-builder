const node_env = process.env.NODE_ENV || 'production';
const node_port = process.env.PORT || 443;

module.exports = {
    node_env: node_env,
    node_port: node_port
};
