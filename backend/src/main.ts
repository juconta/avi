import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableCors({ origin: true, credentials: true })

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  )

  const config = new DocumentBuilder()
    .setTitle('AVI API')
    .setDescription('Asiento Virtual Interactivo — API de streaming PPV')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 4000
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 AVI backend corriendo en http://0.0.0.0:${port}`)
}

bootstrap()
