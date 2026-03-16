import {NestFactory} from "@nestjs/core"
import {AppModule} from "./app.module"
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";


async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule)

    const  config = new DocumentBuilder()
        .setTitle("урок по лалала")
        .setDescription("Документация по rest api")
        .setVersion("1.0")
        .addTag("zulin")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);


    await app.listen(PORT, () => console.log(`hehe on PORT: ${PORT}`))
}

start()