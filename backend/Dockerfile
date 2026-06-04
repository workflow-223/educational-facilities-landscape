# syntax=docker/dockerfile:1.6

# Build
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

COPY gradle/wrapper/ gradle/wrapper/
COPY gradlew gradlew.bat ./
RUN chmod +x ./gradlew

COPY build.gradle ./
COPY src src
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew --no-daemon clean bootJar

# Runtime
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

COPY --from=build /home/gradle/.gradle /root/.gradle
COPY --from=build /app/gradle gradle
COPY --from=build /app/gradlew .
COPY --from=build /app/build.gradle .
COPY --from=build /app/src src

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]